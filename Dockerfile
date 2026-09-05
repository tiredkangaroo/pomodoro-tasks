# syntax=docker/dockerfile:1

# Multi-stage build:
#   1. `frontend-build`  — Node, compiles the React/Vite SPA into `dist/`
#   2. `backend-build`   — Go, compiles the static server binary
#   3. `runtime`         — minimal Alpine image with the binary + SPA assets

# ------------------------------------------------------------------ frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

# Install dependencies first so the layer is cached unless the lockfile changes.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the SPA.
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------- backend
FROM golang:1.26-alpine AS backend-build

WORKDIR /src

# Resolve modules first for layer/cache efficiency.
COPY backend/go.mod backend/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# Build a static binary with only the server source in the image.
COPY backend/ ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ------------------------------------------------------------------- runtime
FROM alpine:3.22 AS runtime

# CA certificates so outbound HTTPS calls to Google's APIs succeed,
# plus the database-ish daemon does not run as root.
RUN apk add --no-cache ca-certificates \
    && adduser -D -u 10001 appuser

WORKDIR /app

COPY --from=backend-build /out/server /app/server
COPY --from=frontend-build /app/dist /app/static

# Serve the SPA via STATIC_DIR so the API and the frontend share one origin.
# OAuth credentials are injected at run time via `docker run -e`:
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / OAUTH_REDIRECT_URL / FRONTEND_URL
ENV PORT=8080 \
    STATIC_DIR=/app/static \
    SECURE_COOKIES=false

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["/app/server"]