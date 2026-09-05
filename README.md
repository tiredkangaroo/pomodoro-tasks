# pomodoro · tasks

A focused Pomodoro timer and task workspace that reads your real Google Tasks
and turns them into a three-column board for the work day.

- **Backend:** Go (standard library HTTP server + Google Tasks API)
- **Frontend:** React + Vite + Tailwind CSS v4
- **Design:** warm cream (`#FFE8C8`) canvas, League Spartan display type,
  Canva Sans body type, white rounded task cards

```
to-do            working | break            done
[ task card ]         25:00                 [ task card ]
[ task card ]           ▶                   [ task card ]
                    in-progress
                    [ task card ]
```

## How it behaves

| Action | Effect |
| --- | --- |
| Sign in | OAuth 2.0 with Google; the board is never rendered before a valid session exists |
| Initial load | Every **non-completed** task across **all** tasklists is fetched into `to-do` |
| `to-do` ⇄ `in-progress` | Drag freely. Local state only — nothing is sent to Google |
| `to-do` / `in-progress` → `done` | Immediately patches the task to `status: completed` in Google Tasks |
| `done` → anywhere | Not allowed. Done cards are not draggable |
| `done` column contents | Only tasks completed in this browser session; pre-existing completed tasks are never fetched |
| Page reload | `in-progress` and `done` reset to empty; remaining open tasks reload into `to-do` |
| Timer start / finish | Never moves cards. Card progression is drag-and-drop only |
| `break` tab | Timer switches to a 5-minute break and the whole in-progress section is hidden; `working` reveals it again |

Descriptions coming from Google Tasks notes are scanned for URLs and email
addresses, which render as real anchors with `target="_blank"` and
`rel="noopener noreferrer"`.

If a completion call fails, the card animates back to the exact column and
position it came from and an inline error appears — local state never silently
drifts from Google.

## Google Cloud setup

1. Create (or pick) a project at <https://console.cloud.google.com>.
2. **APIs & Services → Library →** enable **Google Tasks API**.
3. **APIs & Services → OAuth consent screen →** configure it, add the scope
   `https://www.googleapis.com/auth/tasks`, and add your Google account under
   **Test users** while the app is in testing mode.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID →
   Web application**, then add the authorized redirect URI:

   ```
   http://localhost:8080/api/auth/callback
   ```

5. Copy the client ID and secret into `backend/.env` (see below).

## Running locally

**1. Backend** (port 8080)

```bash
cd backend
cp .env.example .env      # then paste in your client ID + secret
set -a && source .env && set +a
go run ./cmd/server
```

**2. Frontend** (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api/*` to the Go server, so the
browser stays on a single origin and the `HttpOnly` session cookie is sent
automatically.

## Production build

```bash
cd frontend && npm run build          # -> frontend/dist
cd ../backend && STATIC_DIR=../frontend/dist go run ./cmd/server
```

With `STATIC_DIR` set, the Go server serves the built SPA alongside the API on
a single origin. Remember to set `SECURE_COOKIES=true` behind HTTPS and to
update `OAUTH_REDIRECT_URL` / `FRONTEND_URL` to your real domain (and to add
the redirect URI to the OAuth client).

## Project layout

```
backend/
  cmd/server/main.go            entrypoint, graceful shutdown
  internal/config/              env loading + validation
  internal/session/             in-memory session + OAuth state store
  internal/googletasks/         Google Tasks API wrapper (list open, complete)
  internal/httpapi/             routes, CORS, OAuth flow, handlers
frontend/
  public/fonts/                 League Spartan + Canva Sans (woff2)
  src/lib/api.js                fetch wrapper, 401 -> re-auth
  src/lib/board.js              column IDs and movement rules
  src/lib/linkify.js            plain-text -> text/link/email tokens
  src/hooks/useAuth.js          auth gate state
  src/hooks/useBoard.js         column state, drag moves, completion sync
  src/hooks/useTimer.js         per-mode countdown, chime, tab title
  src/components/               Board, TaskList, TaskCard, ModeToggle, …
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe |
| `GET` | `/api/auth/status` | `{ "authenticated": bool }` |
| `GET` | `/api/auth/login` | Redirects to Google's consent screen |
| `GET` | `/api/auth/callback` | Exchanges the code, sets the session cookie |
| `POST` | `/api/auth/logout` | Drops the session |
| `GET` | `/api/tasks` | All non-completed tasks across every tasklist |
| `POST` | `/api/tasks/complete` | `{ "tasklistId": "…", "taskId": "…" }` → marks completed |

Tokens live only in server memory keyed by an opaque `HttpOnly`,
`SameSite=Lax` cookie; they are never exposed to the browser.

## Notes

- Timer defaults: 25:00 working, 5:00 break. Each mode keeps its own remaining
  time, and switching tabs pauses the countdown instead of discarding it.
- A small reset control appears next to play/pause once a countdown has been
  started.
- Sessions expire after 12 hours, and a 401 from any API call returns the user
  to the sign-in screen with an explanatory message.
