// Package config loads runtime configuration from the environment.
package config

import (
	"fmt"
	"os"
	"strings"
)

// Config holds every value the server needs to boot.
type Config struct {
	Port         string
	ClientID     string
	ClientSecret string
	RedirectURL  string
	// FrontendURL is where the browser is sent back to after the OAuth dance
	// and is also the only origin allowed to talk to the API.
	FrontendURL string
	// SecureCookies should be true whenever the app is served over HTTPS.
	SecureCookies bool
}

// Load reads configuration from the environment, applying sensible local
// development defaults, and validates that the OAuth credentials are present.
func Load() (Config, error) {
	cfg := Config{
		Port:          env("PORT", "8080"),
		ClientID:      strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID")),
		ClientSecret:  strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_SECRET")),
		RedirectURL:   env("OAUTH_REDIRECT_URL", "http://localhost:8080/api/auth/callback"),
		FrontendURL:   strings.TrimRight(env("FRONTEND_URL", "http://localhost:5173"), "/"),
		SecureCookies: env("SECURE_COOKIES", "false") == "true",
	}

	var missing []string
	if cfg.ClientID == "" {
		missing = append(missing, "GOOGLE_CLIENT_ID")
	}
	if cfg.ClientSecret == "" {
		missing = append(missing, "GOOGLE_CLIENT_SECRET")
	}
	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}
	return cfg, nil
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}
