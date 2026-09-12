import AppWorkspace from './AppWorkspace.jsx'
import { RouterProvider, useRouter } from './lib/router.jsx'
import Home from './pages/Home.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'

function Routes() {
  const { path } = useRouter()

  if (path === '/terms' || path.startsWith('/terms/')) return <Terms />
  if (path === '/privacy' || path.startsWith('/privacy/')) return <Privacy />
  if (path === '/app' || path.startsWith('/app/')) return <AppWorkspace />
  return <Home />
}

export default function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  )
}