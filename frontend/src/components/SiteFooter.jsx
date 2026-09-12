import { Link } from '../lib/router.jsx'

/** Shared site footer used on the public pages. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 px-6 py-8 md:px-10 lg:px-14">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-body text-[0.75rem] text-ink/40">
          © {new Date().getFullYear()} pomodoro · tasks
        </p>
        <nav className="flex items-center gap-6 font-body text-[0.75rem] text-ink/50">
          <Link to="/privacy" className="transition-colors hover:text-ink">
            privacy policy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-ink">
            terms of service
          </Link>
          <Link to="/app" className="font-bold text-ink/70 transition-colors hover:text-ink">
            sign in
          </Link>
        </nav>
      </div>
    </footer>
  )
}