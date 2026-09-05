import Board from './components/Board.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useBoard } from './hooks/useBoard.js'
import { useTimer } from './hooks/useTimer.js'

export default function App() {
  const auth = useAuth()
  const timer = useTimer()
  const board = useBoard({
    enabled: auth.status === 'signedIn',
    onSessionExpired: auth.handleSessionExpired,
  })

  if (auth.status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-display text-2xl font-bold tracking-tight text-black/30">loading…</p>
      </main>
    )
  }

  if (auth.status === 'signedOut') {
    return <LoginScreen error={auth.error} />
  }

  return <Board board={board} timer={timer} onSignOut={auth.signOut} />
}
