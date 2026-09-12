import { Link } from '../lib/router.jsx'

/** Shared site header used on the public pages. */
export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-14">
      <Link
        to="/"
        className="font-display text-[1.35rem] leading-none font-bold tracking-tight text-black transition-opacity hover:opacity-70"
      >
        pomodoro<span className="text-ink/40"> · tasks</span>
      </Link>
      <nav className="flex items-center gap-6 font-body text-[0.85rem] text-ink/55">
        <Link to="/app" className="transition-colors hover:text-ink">
          open app
        </Link>
        <Link to="/privacy" className="transition-colors hover:text-ink">
          privacy
        </Link>
        <Link to="/terms" className="transition-colors hover:text-ink">
          terms
        </Link>
      </nav>
    </header>
  )
}