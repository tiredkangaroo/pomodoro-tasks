import GoogleButton from './GoogleButton.jsx'

/**
 * The OAuth gate shown at /app when no valid session exists. The main
 * interface is never rendered until the backend confirms an authenticated
 * Google Tasks session.
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

        <div className="mt-8 flex justify-center">
          <GoogleButton />
        </div>

        <p className="mt-6 font-body text-[0.7rem] leading-relaxed text-ink/40">
          Read and write access to Google Tasks is used only to load your open
          tasks and mark them complete.
        </p>
      </div>
    </main>
  )
}