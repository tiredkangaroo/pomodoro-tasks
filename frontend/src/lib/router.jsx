import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const RouteContext = createContext(null)

/**
 * Tiny client-side router built on the History API. Path-based URLs keep every
 * route deep-linkable and shareable; the Go server falls back to index.html
 * for unknown paths and Vite does the same in development.
 */
export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback(
    (to, { replace = false } = {}) => {
      if (to === window.location.pathname) return
      if (replace) {
        window.history.replaceState({}, '', to)
      } else {
        window.history.pushState({}, '', to)
      }
      setPath(window.location.pathname)
      window.scrollTo({ top: 0 })
    },
    [],
  )

  return <RouteContext.Provider value={{ path, navigate }}>{children}</RouteContext.Provider>
}

export function useRouter() {
  return useContext(RouteContext)
}

/** Anchor that navigates client-side, preserving normal link affordances. */
export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter()
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  const handleClick = useCallback(
    (event) => {
      if (event.defaultPrevented) return
      const modifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      if (modifier || event.button !== 0) return
      event.preventDefault()
      navigate(to)
      onClickRef.current?.(event)
    },
    [navigate, to],
  )

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}