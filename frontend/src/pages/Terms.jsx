import LegalPage, { LegalSection } from '../components/LegalPage.jsx'
import { Link } from '../lib/router.jsx'

/**
 * Terms of Service — displayed at /terms as required by the Google OAuth
 * consent screen.
 */
export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="September 12, 2026">
      <LegalSection number={1} title="Agreement to these terms">
        <p>
          These Terms of Service (“Terms”) govern your use of pomodoro · tasks
          (the “Service”). By signing in or using the Service, you agree to these
          Terms. If you do not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection number={2} title="The Service">
        <p>
          The Service is a Pomodoro timer and task board that works with Google
          Tasks. After you sign in with Google, the Service loads your open
          tasks into a three-column board (to-do, in-progress, done) and marks a
          task complete when you move it into the done column. The Service is
          provided for your personal productivity use.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Signing in with Google">
        <p>
          To use the Service you must sign in with your Google account. You are
          responsible for your Google account and for keeping your login
          credentials secure. You may stop using the Service and revoke its
          access to your Google account at any time, either by signing out or
          through your Google account settings.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Your content">
        <p>
          You retain all rights to the tasks and other content in your Google
          Tasks. You grant the Service the limited permission to read and update
          your tasks solely so it can display them and record the completions you
          ask for. We do not otherwise use your content, and we do not sell or
          share it.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Acceptable use">
        <p>
          You agree not to misuse the Service, including by attempting to gain
          unauthorized access to the Service or its systems, interfering with its
          normal operation, or using it in a way that violates applicable law.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Privacy">
        <p>
          Your use of the Service is also governed by our{' '}
          <Link to="/privacy" className="font-bold text-black underline underline-offset-2">
            Privacy Policy
          </Link>
          , which explains what data we access, why, and how it is handled.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Third-party services">
        <p>
          The Service relies on Google, including Google sign-in and the Google
          Tasks API. Your use of Google services is subject to Google’s own terms
          and privacy policy. We are not responsible for the availability or
          behavior of Google’s services.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Disclaimers">
        <p>
          The Service is provided on an “as is” and “as available” basis, without
          warranties of any kind, express or implied, including merchantability,
          fitness for a particular purpose, or non-infringement. We do not
          warrant that the Service will be uninterrupted, error-free, or secure.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          for any loss of data or profits, arising out of or relating to your use
          of the Service.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Changes and termination">
        <p>
          We may update these Terms from time to time; the date above shows when
          they were last revised. Continued use of the Service after changes are
          posted means you accept the updated Terms. We may suspend or terminate
          access to the Service for conduct that violates these Terms.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Contact">
        <p>
          If you have any questions about these Terms, please reach out using the
          contact details provided on this site.
        </p>
      </LegalSection>

      </LegalPage>
  )
}