import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — PlaceAI',
  description:
    'The rules of using PlaceAI. Account responsibilities, billing via Razorpay, cancellations, content ownership, and governing law.',
};

const LAST_UPDATED = 'June 1, 2026';

export default function TermsPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Terms of <span className="text-gradient">service</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            The agreement between you and PlaceAI. We&apos;ve written it in plain English.
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
                1. Agreement
              </h2>
              <p>
                By creating an account on PlaceAI (operated by PlaceAI Technologies Pvt. Ltd.) you
                agree to these Terms. If you don&apos;t agree, don&apos;t use the service. These
                Terms, together with our{' '}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>
                , form the full agreement between us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                2. Account responsibilities
              </h2>
              <p>
                You must be at least 18 years old. You&apos;re responsible for keeping your account
                credentials safe and for everything that happens on your account. One account per
                person — no sharing logins or running multiple free accounts to dodge limits. Tell
                us immediately at{' '}
                <a href="mailto:support@placeai.in" className="text-brand hover:underline">
                  support@placeai.in
                </a>{' '}
                if you suspect unauthorized access.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                3. Payments and billing
              </h2>
              <p>
                Paid plans are billed monthly or annually via <strong>Razorpay</strong>. Prices
                listed on the pricing page are in Indian Rupees and inclusive of applicable GST
                unless otherwise stated. You authorize Razorpay to charge your selected payment
                method (UPI, card, net banking, or wallet) on each billing cycle until you cancel.
                Failed payments will trigger a 7-day grace period; after that your subscription
                downgrades to Free.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                4. Cancellations and refunds
              </h2>
              <p>
                You can cancel anytime from <strong>Settings → Billing</strong>. Cancellation
                takes effect at the end of the current billing period — you keep paid features
                until then. We offer pro-rata refunds on unused days for monthly plans and within
                14 days for annual plans, no questions asked. After 14 days, annual plans are
                non-refundable but you retain access until renewal. Email us at{' '}
                <a href="mailto:support@placeai.in" className="text-brand hover:underline">
                  support@placeai.in
                </a>{' '}
                for refund processing.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                5. Content ownership
              </h2>
              <p>
                <strong>Your resume is yours.</strong> You retain full ownership of all content you
                upload, paste, or generate on PlaceAI — resumes, cover letters, job tracker
                entries, interview answers, everything. You grant us a limited, non-exclusive
                license to store and process it solely to deliver the service to you. When you
                delete content or close your account, that license ends and your data is removed
                per our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                6. AI-generated output
              </h2>
              <p>
                Bullet points, cover letters, and interview answers generated by Claude are
                suggestions, not guarantees. Always review them for accuracy before using them in a
                real application. Don&apos;t represent fabricated experience as real — that&apos;s
                your responsibility, not ours.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                7. Prohibited use
              </h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Scrape, reverse-engineer, or resell PlaceAI features or data.</li>
                <li>
                  Use the service to spam recruiters, send harassment, or fabricate credentials for
                  fraud.
                </li>
                <li>
                  Upload content you don&apos;t own or have permission to use (someone else&apos;s
                  resume, copyrighted material, etc.).
                </li>
                <li>
                  Attempt to access another user&apos;s account, exploit security vulnerabilities,
                  or interfere with infrastructure.
                </li>
                <li>
                  Use the service to build a competing product or train a competing AI model.
                </li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts engaged in prohibited use,
                with a refund of unused paid time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                8. Service availability
              </h2>
              <p>
                We aim for 99.9% uptime but don&apos;t promise it contractually. Planned maintenance
                will be announced in advance. If a critical AI feature is down for more than 24
                hours straight, write to us — we&apos;ll credit your account or extend your
                subscription.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                9. Limitation of liability
              </h2>
              <p>
                PlaceAI is a tool to help you prepare. We do not guarantee job offers, interview
                outcomes, or placement results. To the maximum extent permitted by Indian law, our
                total liability to you for any claim arising from your use of the service is
                limited to the amount you paid us in the 12 months preceding the claim. We are not
                liable for indirect, incidental, or consequential damages — lost offers, lost wages,
                missed deadlines, etc.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                10. Termination
              </h2>
              <p>
                You can close your account anytime from Settings. We may suspend or terminate your
                access if you breach these Terms, with notice where reasonably possible. On
                termination, your right to use the service ends immediately; the clauses on
                content ownership, liability, and governing law survive.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                11. Changes to these terms
              </h2>
              <p>
                We may update these Terms. Material changes will be emailed to you at least 14
                days before they take effect. Continuing to use PlaceAI after the change date
                means you accept the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                12. Governing law and jurisdiction
              </h2>
              <p>
                These Terms are governed by the laws of India. Any dispute that can&apos;t be
                resolved between us amicably will fall under the exclusive jurisdiction of the
                courts of <strong>Mumbai, Maharashtra</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                See also our{' '}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>{' '}
                or{' '}
                <Link href="/contact" className="text-brand hover:underline">
                  contact us
                </Link>{' '}
                with questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
