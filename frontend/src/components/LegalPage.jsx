import SiteFooter from './SiteFooter.jsx'
import SiteHeader from './SiteHeader.jsx'

/** A titled, numbered legal section rendered inside a LegalPage. */
export function LegalSection({ number, title, children }) {
  return (
    <section>
      <h2 className="font-display text-[1.35rem] leading-tight font-bold tracking-tight text-black">
        <span className="text-ink/30">{number}.</span> {title}
      </h2>
      <div className="mt-4 space-y-4 font-body text-[0.93rem] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  )
}

/**
 * Shared chrome for the legal pages: header, a reading column with the
 * document, and footer.
 */
export default function LegalPage({ title, updated, children }) {
  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 md:px-10">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-none font-bold tracking-tight text-black">
          {title}
        </h1>
        <p className="mt-3 font-body text-[0.8rem] text-ink/40">Last updated: {updated}</p>
        <article className="animate-section-enter mt-8 space-y-10 rounded-card bg-white/70 p-7 shadow-[0_2px_10px_rgba(120,84,40,0.08)] md:p-12">
          {children}
        </article>
      </div>
      <SiteFooter />
    </main>
  )
}