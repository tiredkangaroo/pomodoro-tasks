// Package httpapi wires the HTTP routes, middleware and OAuth flow together.
package httpapi

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/oauth2"
	googleoauth "golang.org/x/oauth2/google"
	tasksapi "google.golang.org/api/tasks/v1"

	"pomodoro/internal/config"
	"pomodoro/internal/googletasks"
	"pomodoro/internal/session"
)

// Server holds the dependencies shared by every handler.
type Server struct {
	cfg      config.Config
	oauthCfg *oauth2.Config
	sessions *session.Store
}

// NewServer constructs a Server for the given configuration.
func NewServer(cfg config.Config, store *session.Store) *Server {
	return &Server{
		cfg:      cfg,
		sessions: store,
		oauthCfg: &oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{tasksapi.TasksScope},
			Endpoint:     googleoauth.Endpoint,
		},
	}
}

// Handler returns the fully configured root http.Handler.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", s.handleHealth)
	mux.HandleFunc("GET /api/auth/status", s.handleAuthStatus)
	mux.HandleFunc("GET /api/auth/login", s.handleAuthLogin)
	mux.HandleFunc("GET /api/auth/callback", s.handleAuthCallback)
	mux.HandleFunc("POST /api/auth/logout", s.handleAuthLogout)
	mux.HandleFunc("GET /api/tasks", s.requireSession(s.handleListTasks))
	mux.HandleFunc("POST /api/tasks/complete", s.requireSession(s.handleCompleteTask))

	if dir := strings.TrimSpace(os.Getenv("STATIC_DIR")); dir != "" {
		mux.Handle("/", spaHandler(dir))
	}

	return s.withCORS(mux)
}

// ---------------------------------------------------------------- middleware

// withCORS allows the Vite dev server to call the API with cookies attached.
func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" && origin == s.cfg.FrontendURL {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Vary", "Origin")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type authedHandler func(w http.ResponseWriter, r *http.Request, sessionID string, token *oauth2.Token)

// requireSession rejects unauthenticated requests with a 401 so the frontend
// can bounce the user back to the login screen.
func (s *Server) requireSession(next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := s.sessionID(r)
		token, ok := s.sessions.Token(id)
		if !ok {
			writeError(w, http.StatusUnauthorized, "not authenticated")
			return
		}
		next(w, r, id, token)
	}
}

// ------------------------------------------------------------------ handlers

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleAuthStatus(w http.ResponseWriter, r *http.Request) {
	_, ok := s.sessions.Token(s.sessionID(r))
	writeJSON(w, http.StatusOK, map[string]bool{"authenticated": ok})
}

func (s *Server) handleAuthLogin(w http.ResponseWriter, r *http.Request) {
	state := s.sessions.NewState()
	url := s.oauthCfg.AuthCodeURL(state,
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
	http.Redirect(w, r, url, http.StatusFound)
}

func (s *Server) handleAuthCallback(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	if errParam := query.Get("error"); errParam != "" {
		s.redirectToFrontend(w, r, "error="+errParam)
		return
	}
	if !s.sessions.ConsumeState(query.Get("state")) {
		s.redirectToFrontend(w, r, "error=invalid_state")
		return
	}
	code := query.Get("code")
	if code == "" {
		s.redirectToFrontend(w, r, "error=missing_code")
		return
	}

	token, err := s.oauthCfg.Exchange(r.Context(), code)
	if err != nil {
		log.Printf("oauth exchange failed: %v", err)
		s.redirectToFrontend(w, r, "error=exchange_failed")
		return
	}

	s.setSessionCookie(w, s.sessions.Create(token))
	s.redirectToFrontend(w, r, "")
}

func (s *Server) handleAuthLogout(w http.ResponseWriter, r *http.Request) {
	s.sessions.Delete(s.sessionID(r))
	s.clearSessionCookie(w)
	writeJSON(w, http.StatusOK, map[string]bool{"authenticated": false})
}

func (s *Server) handleListTasks(w http.ResponseWriter, r *http.Request, sessionID string, token *oauth2.Token) {
	client, err := s.tasksClient(r, sessionID, token)
	if err != nil {
		s.writeGoogleError(w, err)
		return
	}
	tasks, err := client.ListOpenTasks(r.Context())
	if err != nil {
		s.writeGoogleError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks})
}

type completeRequest struct {
	TasklistID string `json:"tasklistId"`
	TaskID     string `json:"taskId"`
}

func (s *Server) handleCompleteTask(w http.ResponseWriter, r *http.Request, sessionID string, token *oauth2.Token) {
	var body completeRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16)).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if body.TasklistID == "" || body.TaskID == "" {
		writeError(w, http.StatusBadRequest, "tasklistId and taskId are required")
		return
	}

	client, err := s.tasksClient(r, sessionID, token)
	if err != nil {
		s.writeGoogleError(w, err)
		return
	}
	task, err := client.CompleteTask(r.Context(), body.TasklistID, body.TaskID)
	if err != nil {
		s.writeGoogleError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"task": task})
}

// ------------------------------------------------------------------- helpers

// tasksClient builds a Google Tasks client and persists any token that the
// oauth2 library refreshed along the way.
func (s *Server) tasksClient(r *http.Request, sessionID string, token *oauth2.Token) (*googletasks.Client, error) {
	ctx := r.Context()
	source := s.oauthCfg.TokenSource(ctx, token)

	fresh, err := source.Token()
	if err != nil {
		return nil, err
	}
	if fresh.AccessToken != token.AccessToken {
		s.sessions.SaveToken(sessionID, fresh)
	}

	return googletasks.New(ctx, oauth2.NewClient(ctx, source))
}

// writeGoogleError maps upstream auth failures onto a 401 so the frontend
// knows to re-authenticate, and everything else onto a 502.
func (s *Server) writeGoogleError(w http.ResponseWriter, err error) {
	var retrieveErr *oauth2.RetrieveError
	if errors.As(err, &retrieveErr) {
		writeError(w, http.StatusUnauthorized, "google authorization expired, please sign in again")
		return
	}
	log.Printf("google tasks error: %v", err)
	writeError(w, http.StatusBadGateway, "google tasks request failed")
}

func (s *Server) sessionID(r *http.Request) string {
	cookie, err := r.Cookie(session.CookieName)
	if err != nil {
		return ""
	}
	return cookie.Value
}

func (s *Server) setSessionCookie(w http.ResponseWriter, id string) {
	http.SetCookie(w, &http.Cookie{
		Name:     session.CookieName,
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.cfg.SecureCookies,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   12 * 60 * 60,
	})
}

func (s *Server) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     session.CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   s.cfg.SecureCookies,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func (s *Server) redirectToFrontend(w http.ResponseWriter, r *http.Request, rawQuery string) {
	target := s.cfg.FrontendURL + "/"
	if rawQuery != "" {
		target += "?" + rawQuery
	}
	http.Redirect(w, r, target, http.StatusFound)
}

// spaHandler serves a built single-page app, falling back to index.html for
// unknown paths so client-side routing keeps working.
func spaHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(dir, filepath.Clean(r.URL.Path))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			files.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(dir, "index.html"))
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
