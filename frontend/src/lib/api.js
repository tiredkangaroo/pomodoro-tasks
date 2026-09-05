/**
 * Thin wrapper around the Go backend.
 *
 * Every call includes credentials so the HttpOnly session cookie travels with
 * the request. A 401 is surfaced as an `UnauthorizedError` so callers can send
 * the user back to the login screen.
 */

export class UnauthorizedError extends Error {
  constructor(message = 'Not authenticated') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })

  if (response.status === 401) {
    throw new UnauthorizedError()
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Request failed (${response.status})`, response.status)
  }

  return payload
}

/** Returns true when the browser holds a valid backend session. */
export async function fetchAuthStatus() {
  const payload = await request('/api/auth/status')
  return Boolean(payload?.authenticated)
}

/** Full-page navigation to the backend, which redirects on to Google. */
export function startLogin() {
  window.location.href = '/api/auth/login'
}

export async function logout() {
  await request('/api/auth/logout', { method: 'POST' })
}

/** All non-completed tasks across every one of the user's tasklists. */
export async function fetchOpenTasks() {
  const payload = await request('/api/tasks')
  return payload?.tasks ?? []
}

/** Marks a task `completed` in Google Tasks. */
export async function completeTask({ tasklistId, taskId }) {
  return request('/api/tasks/complete', {
    method: 'POST',
    body: JSON.stringify({ tasklistId, taskId }),
  })
}
