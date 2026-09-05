// Package session provides an in-memory, cookie-backed session store that
// holds Google OAuth tokens for the duration of a browser session.
package session

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"

	"golang.org/x/oauth2"
)

// CookieName is the name of the session cookie handed to the browser.
const CookieName = "pomodoro_session"

const (
	sessionTTL = 12 * time.Hour
	stateTTL   = 10 * time.Minute
)

type entry struct {
	token     *oauth2.Token
	expiresAt time.Time
}

// Store keeps sessions and in-flight OAuth state values in memory. Sessions
// intentionally do not survive a server restart: the app is session-scoped by
// design and Google issues fresh tokens on the next login.
type Store struct {
	mu       sync.RWMutex
	sessions map[string]*entry
	states   map[string]time.Time
}

// NewStore returns a ready-to-use Store and starts its janitor goroutine.
func NewStore() *Store {
	s := &Store{
		sessions: make(map[string]*entry),
		states:   make(map[string]time.Time),
	}
	go s.janitor()
	return s
}

// NewState mints a single-use CSRF state value for the OAuth redirect.
func (s *Store) NewState() string {
	state := randomID()
	s.mu.Lock()
	s.states[state] = time.Now().Add(stateTTL)
	s.mu.Unlock()
	return state
}

// ConsumeState validates a state value and removes it so it cannot be replayed.
func (s *Store) ConsumeState(state string) bool {
	if state == "" {
		return false
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	expiry, ok := s.states[state]
	delete(s.states, state)
	return ok && time.Now().Before(expiry)
}

// Create stores a token under a brand new session ID.
func (s *Store) Create(token *oauth2.Token) string {
	id := randomID()
	s.mu.Lock()
	s.sessions[id] = &entry{token: token, expiresAt: time.Now().Add(sessionTTL)}
	s.mu.Unlock()
	return id
}

// Token returns the token for a session ID, if the session is still alive.
func (s *Store) Token(id string) (*oauth2.Token, bool) {
	if id == "" {
		return nil, false
	}
	s.mu.RLock()
	e, ok := s.sessions[id]
	s.mu.RUnlock()
	if !ok || time.Now().After(e.expiresAt) {
		return nil, false
	}
	return e.token, true
}

// SaveToken replaces the token for a session, which lets us persist tokens
// that the oauth2 client silently refreshed.
func (s *Store) SaveToken(id string, token *oauth2.Token) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if e, ok := s.sessions[id]; ok {
		e.token = token
	}
}

// Delete removes a session, effectively logging the user out.
func (s *Store) Delete(id string) {
	s.mu.Lock()
	delete(s.sessions, id)
	s.mu.Unlock()
}

func (s *Store) janitor() {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		s.mu.Lock()
		for id, e := range s.sessions {
			if now.After(e.expiresAt) {
				delete(s.sessions, id)
			}
		}
		for state, expiry := range s.states {
			if now.After(expiry) {
				delete(s.states, state)
			}
		}
		s.mu.Unlock()
	}
}

func randomID() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		// crypto/rand only fails in catastrophic situations; a panic here is
		// preferable to handing out a predictable session identifier.
		panic("session: unable to read random bytes: " + err.Error())
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}
