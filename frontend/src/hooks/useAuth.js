import { useCallback, useEffect, useState } from 'react'
import { fetchAuthStatus, logout as logoutRequest } from '../lib/api.js'

/** Reads the `?error=` code the backend appends when OAuth fails. */
function readOAuthError() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('error')
  if (!code) return null

  // Clean the URL so a refresh doesn't resurrect the banner.
  window.history.replaceState({}, '', window.location.pathname)

  return (
    {
      access_denied: 'Google access was denied. Sign in again to continue.',
      invalid_state: 'That sign-in attempt expired. Please try again.',
      missing_code: 'Google did not return an authorization code.',
      exchange_failed: 'Could not complete sign-in with Google. Please try again.',
    }[code] ?? 'Sign-in with Google failed. Please try again.'
  )
}

/**
 * Auth gate state. `status` is one of `checking` | `signedOut` | `signedIn`.
 */
export function useAuth() {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState(() => readOAuthError())

  const refresh = useCallback(async () => {
    try {
      const authenticated = await fetchAuthStatus()
      setStatus(authenticated ? 'signedIn' : 'signedOut')
    } catch {
      setStatus('signedOut')
      setError((current) => current ?? 'Cannot reach the server. Is the Go backend running?')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setStatus('signedOut')
      setError(null)
    }
  }, [])

  /** Called when an API request comes back 401 mid-session. */
  const handleSessionExpired = useCallback(() => {
    setStatus('signedOut')
    setError('Your session expired. Please sign in again.')
  }, [])

  return { status, error, setError, refresh, signOut, handleSessionExpired }
}
