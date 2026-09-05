import { startLogin } from '../lib/api.js'

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[1.05rem] w-[1.05rem]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

/**
 * The OAuth gate. The main interface is never rendered until the backend
 * confirms an authenticated Google Tasks session.
 */
export default function LoginScreen({ error }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="animate-section-enter w-full max-w-md text-center">
        <h1 className="font-display text-[3.25rem] leading-none font-bold tracking-tight text-black">
          pomodoro
        </h1>
        <p className="mt-4 font-body text-sm leading-relaxed text-muted">
          A focused workspace for your day. Sign in with Google to pull in your
          open tasks and start a session.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-card bg-white/80 px-4 py-3 font-body text-[0.8rem] leading-relaxed text-[#9a3412]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={startLogin}
          className={[
            'mt-8 inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-3.5',
            'font-body text-[0.95rem] font-bold text-black',
            'shadow-[0_2px_10px_rgba(120,84,40,0.14)]',
            'transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]',
          ].join(' ')}
        >
          <GoogleMark />
          continue with Google
        </button>

        <p className="mt-6 font-body text-[0.7rem] leading-relaxed text-ink/40">
          Read and write access to Google Tasks is used only to load your open
          tasks and mark them complete.
        </p>
      </div>
    </main>
  )
}
