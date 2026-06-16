import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — PlaceAI',
  description:
    'How PlaceAI collects, stores, and processes your data. DPDP Act 2023 compliant. Built with privacy as a first-class concern, not an afterthought.',
};

const LAST_UPDATED = 'June 1, 2026';

export default function PrivacyPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            <span className="text-gradient">Privacy</span> policy
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Plain-English version of how we handle your data. The lawyer version follows.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-10 space-y-8 text-foreground/90 leading-relaxed">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                1. Who we are
              </h2>
              <p>
                PlaceAI is operated by PlaceAI Technologies Pvt. Ltd., registered in Maharashtra,
                India. References to &quot;we,&quot; &quot;us,&quot; and &quot;PlaceAI&quot; refer
                to that entity. Reach us at{' '}
                <a href="mailto:support@placeai.in" className="text-brand hover:underline">
                  support@placeai.in
                </a>{' '}
                for any privacy question.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                2. What data we collect
              </h2>
              <p className="mb-3">We only collect what we need to make the product work:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Account data</strong> via Clerk: name, email, profile picture, and any
                  OAuth identifiers you choose to connect (Google, GitHub, LinkedIn).
                </li>
                <li>
                  <strong>Resume content</strong> you upload or paste: your work history,
                  education, skills, and projects. This is the core data we operate on.
                </li>
                <li>
                  <strong>Job tracker entries</strong>: companies, roles, status, and any notes you
                  add yourself.
                </li>
                <li>
                  <strong>Usage events</strong>: which features you used, how often, and what
                  failed — for product analytics and reliability monitoring.
                </li>
                <li>
                  <strong>Payment metadata</strong> via Razorpay: subscription tier, invoice ID, GST
                  details if you provide them. We never see your card or UPI credentials.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                3. How and where it&apos;s stored
              </h2>
              <p>
                All user data is stored in <strong>Neon Postgres</strong> hosted in the AWS{' '}
                <code className="text-xs bg-secondary/40 px-1.5 py-0.5 rounded">ap-south-1</code>{' '}
                (Mumbai) region. Uploaded files (PDF resumes, exported docs) live in AWS S3 in the
                same region. We use TLS 1.2+ in transit and AES-256 at rest. Daily encrypted
                backups are retained for 30 days, then permanently destroyed.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                4. AI processing disclosure
              </h2>
              <p>
                Resume tailoring, ATS analysis, cover letter generation, and mock interviews are
                powered by Anthropic&apos;s <strong>Claude API</strong>. When you trigger one of
                these features, the relevant portion of your resume and the target JD are sent to
                Anthropic for processing. Per Anthropic&apos;s commercial terms, that data is not
                used to train their models and is deleted from their systems after a short
                retention window. We never send your contact details, payment info, or login
                credentials to any AI provider.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                5. Cookies and analytics
              </h2>
              <p>
                We use first-party session cookies (via Clerk) for authentication and a minimal
                self-hosted analytics setup that records anonymous page views and feature usage.
                We do not run third-party ad trackers, Facebook pixels, or session-replay tools.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                6. Sharing your data
              </h2>
              <p>
                We don&apos;t sell your data. Ever. We only share data with vendors strictly
                necessary to deliver the product: Clerk (auth), Neon (database), AWS (hosting),
                Anthropic (AI), Razorpay (payments), and Resend (transactional email). Each is
                bound by their own DPA with us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                7. Your rights (DPDP Act 2023)
              </h2>
              <p className="mb-3">
                Under the Digital Personal Data Protection Act, 2023, as an Indian resident you
                have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Access a copy of all personal data we hold about you.</li>
                <li>Correct any inaccurate or out-of-date information.</li>
                <li>
                  Delete your account and all associated data (one-click from Settings, or email
                  us). Deletion is irreversible and completes within 30 days.
                </li>
                <li>Withdraw consent for processing at any time.</li>
                <li>Nominate a person to exercise your rights if you become unable to.</li>
                <li>
                  File a complaint with the Data Protection Board of India if you believe we&apos;ve
                  mishandled your data.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these, email{' '}
                <a href="mailto:support@placeai.in" className="text-brand hover:underline">
                  support@placeai.in
                </a>
                . We respond within 7 working days.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                8. Data retention
              </h2>
              <p>
                Active accounts: data is retained as long as your account is open. Closed
                accounts: data is hard-deleted within 30 days of cancellation, except where Indian
                tax law requires us to keep invoice records for 8 years (in which case only billing
                metadata is retained, not resume content).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                9. Children
              </h2>
              <p>
                PlaceAI is intended for users 18 years or older. We do not knowingly collect data
                from children under 18. If you believe a minor has created an account, write to us
                and we&apos;ll delete it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                10. Changes to this policy
              </h2>
              <p>
                We&apos;ll email you and post a banner on the dashboard before any material change.
                Cosmetic or clarifying edits will simply update the &quot;last updated&quot; date
                above.
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Questions? See our{' '}
                <Link href="/terms" className="text-brand hover:underline">
                  Terms of Service
                </Link>{' '}
                or{' '}
                <Link href="/contact" className="text-brand hover:underline">
                  get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
