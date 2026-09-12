import GoogleButton from '../components/GoogleButton.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { Link } from '../lib/router.jsx'

const features = [
  {
    title: 'Your tasks, in order',
    body: 'Sign in once and every open task across your Google Task lists lands in to-do, titles and notes intact. Tasks you already finished are never fetched.',
  },
  {
    title: 'Work the timer',
    body: '25 minutes of focus, 5 to breathe. Working and break each keep their own countdown, so switching modes never loses your place.',
  },
  {
    title: 'Drag to done',
    body: 'Pull a card into in-progress to start it, then into done to finish. The moment a card lands, the task is marked complete in your Google Tasks.',
  },
]

const dataFacts = [
  {
    title: 'What we read',
    body: 'Your list of open Google Tasks — titles and notes — when the app loads, so they can appear on your board.',
  },
  {
    title: 'What we write',
    body: 'One thing only: a task is marked completed in your Google Tasks when you drag its card into the done column.',
  },
  {
    title: 'What we never do',
    body: 'We never read your email, contacts, Drive, or anything outside Google Tasks. No ads, no analytics, and your data is never sold or shared.',
  },
  {
    title: 'Where it lives',
    body: 'Your Google access token stays in a server memory session for up to 12 hours and is never sent to the browser. Tasks are never copied or stored on our servers.',
  },
]

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-display text-[0.8rem] font-bold tracking-[0.25em] text-ink/40 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-none font-bold tracking-tight text-black">
        {title}
      </h2>
    </div>
  )
}

/**
 * Public marketing homepage. It always renders — no login required — and
 * explains the product, its functionality, and exactly what data the Google
 * sign-in requests and why, as required by the OAuth consent screen.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />

      {/* ------------------------------------------------------------ hero */}
      <section className="animate-section-enter mx-auto w-full max-w-4xl px-6 pt-16 text-center md:px-10 md:pt-24">
        <p className="font-display text-[0.85rem] font-bold tracking-[0.3em] text-ink/40 uppercase">
          pomodoro · tasks
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.75rem,6.5vw,4.75rem)] leading-[0.95] font-bold tracking-tight text-black">
          Focus on the work,
          <br />
          one task at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-[1.05rem] leading-relaxed text-muted">
          A Pomodoro timer and task board that turns your Google Tasks into a
          three-column workspace for the day — to-do, in-progress, and done.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <GoogleButton />
          <p className="max-w-sm font-body text-[0.7rem] leading-relaxed text-ink/45">
            Signing in reads your open Google Tasks and lets you mark them
            complete when you finish — and nothing else. See{' '}
            <Link to="/privacy" className="underline underline-offset-2 transition-opacity hover:opacity-70">
              how we use your data
            </Link>{' '}
            below.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <SectionHeading eyebrow="how it works" title="A calmer way to work your tasks" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-card bg-white/80 p-7 shadow-[0_2px_10px_rgba(120,84,40,0.08)]"
            >
              <h3 className="font-display text-xl leading-none font-bold tracking-tight text-black">
                {feature.title}
              </h3>
              <p className="mt-4 font-body text-[0.88rem] leading-relaxed text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ data transparency */}
      <section className="border-y border-ink/10 bg-cream-deep/40 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <SectionHeading
            eyebrow="your data"
            title="Exactly what we ask for, and why"
          />
          <p className="mx-auto mt-6 max-w-2xl text-center font-body text-[0.95rem] leading-relaxed text-muted">
            We built this app to take you closer to your own tasks, not to
            collect anything else. The only Google scope we request is{' '}
            <code className="rounded bg-white/70 px-1.5 py-0.5 font-body text-[0.82rem] text-ink">
              Google Tasks
            </code>{' '}
            — nothing more.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {dataFacts.map((fact) => (
              <div key={fact.title} className="rounded-card bg-white/80 p-7 shadow-[0_2px_10px_rgba(120,84,40,0.08)]">
                <h3 className="font-display text-lg leading-none font-bold tracking-tight text-black">
                  {fact.title}
                </h3>
                <p className="mt-3 font-body text-[0.88rem] leading-relaxed text-muted">{fact.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center font-body text-[0.85rem] text-ink/45">
            The full picture is in our{' '}
            <Link to="/privacy" className="font-bold text-black underline underline-offset-2 transition-opacity hover:opacity-70">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center md:px-10 md:py-28">
        <h2 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-none font-bold tracking-tight text-black">
          Start your next focused session
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-[0.95rem] leading-relaxed text-muted">
          Sign in with Google, and your open tasks are ready on your board in
          seconds.
        </p>
        <div className="mt-8 flex justify-center">
          <GoogleButton />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}