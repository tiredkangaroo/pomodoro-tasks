import LegalPage, { LegalSection } from '../components/LegalPage.jsx'
import { Link } from '../lib/router.jsx'

/**
 * Privacy Policy — displayed at /privacy as required by the Google OAuth
 * consent screen. Mirror this page's content if you link to it from that
 * consent screen's "Privacy policy URL" field.
 */
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="September 12, 2026">
      <LegalSection number={1} title="Overview">
        <p>
          pomodoro · tasks helps you focus on your Google Tasks with a Pomodoro
          timer. We designed it to collect as little as possible: the Service
          exists only to show you your own tasks and mark the ones you finish.
        </p>
        <p>This policy explains what we access, why, and how it is handled.</p>
      </LegalSection>

      <LegalSection number={2} title="Information we access">
        <p>
          When you sign in with Google, the Service requests access to a single
          Google API scope:{' '}
          <code className="rounded bg-white/70 px-1.5 py-0.5 font-body text-[0.85rem] text-ink">
            Google Tasks
          </code>
          . With that permission:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-bold text-ink/70">We read</span> your list of
            non-completed Google Tasks (titles and notes) so they can appear on
            your board. Tasks you have already completed are never fetched.
          </li>
          <li>
            <span className="font-bold text-ink/70">We write</span> to your
            Google Tasks only when you drag a card into the done column — the
            task is marked completed at that moment.
          </li>
        </ul>
        <p>
          We never access your email, contacts, Drive, or any other Google data.
          We do not use analytics, advertising trackers, or fingerprinting.
        </p>
      </LegalSection>

      <LegalSection number={3} title="How we use information">
        <p>
          Information from Google Tasks is used solely to provide the features you
          see: rendering your board and recording the completions you request. It
          is never used for any other purpose.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Storage and retention">
        <p>
          Your Google access token is kept in the server’s memory, keyed to an
          opaque session cookie. Tokens are refreshed as needed and expire after
          12 hours or when you sign out. We do not store your tasks, your token,
          or any other account data on disk or in a database, and we do not copy
          your tasks to our servers.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Cookies">
        <p>
          The Service sets a single session cookie to keep you signed in. It is
          <span className="font-bold text-ink/70"> HttpOnly</span>,{' '}
          <span className="font-bold text-ink/70">SameSite=Lax</span>, and{' '}
          <span className="font-bold text-ink/70">Secure</span> when served over
          HTTPS. We use no advertising or analytics cookies.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Sharing and disclosure">
        <p>
          We do not sell, rent, or share your personal information with anyone.
          The only external party that receives data as part of the Service is
          Google itself, because reading and updating your tasks requires calling
          the Google Tasks API on your behalf. We may disclose information only
          if required to do so by law.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Security">
        <p>
          The Google access token never leaves the server and is never exposed to
          the browser. The session cookie travels only over HTTPS in production.
          Keep that cookie private: it is effectively your sign-in credential to
          this Service.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Your choices">
        <p>
          You can sign out at any time to end the session, and you can revoke the
          Service’s access entirely from your Google account (“Third-party apps &
          services” under your Google Account settings). Revoking access removes
          the Service’s ability to read or update your tasks; because we store
          nothing of your own, there is nothing further for us to delete.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Children's privacy">
        <p>
          The Service is not directed to children under 13 and we do not knowingly
          process the data of children under 13. If you believe a child has signed
          in, please contact us so we can take appropriate action.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Changes to this policy">
        <p>
          We may update this policy from time to time; the date above shows when
          it was last revised. Material changes will be reflected here before they
          take effect. Your continued use of the Service after updates means you
          accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Contact">
        <p>
          Questions about this policy or our handling of your data? Please reach
          out using the contact details provided on this site. You can also review
          our{' '}
          <Link to="/terms" className="font-bold text-black underline underline-offset-2">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}