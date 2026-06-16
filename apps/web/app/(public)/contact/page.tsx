import type { Metadata } from 'next';
import { Mail, Twitter, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact — PlaceAI',
  description:
    'Get in touch with the PlaceAI team. Email support@placeai.in, DM us on Twitter, or drop a message. We answer every one personally.',
};

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@placeai.in',
    href: 'mailto:support@placeai.in',
    note: 'Usually replied within 24 hours.',
  },
  {
    icon: Twitter,
    label: 'Twitter / X',
    value: '@placeai_in',
    href: 'https://twitter.com/placeai_in',
    note: 'DMs open. Fastest for quick questions.',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon–Fri, 9am – 6pm IST',
    href: null,
    note: 'Weekends we read but reply slowly.',
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Talk to <span className="text-gradient">real humans</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Bug? Feature request? Pricing question? Roast our landing page? We genuinely want to
            hear it. Every email lands in a founder&apos;s inbox.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHANNELS.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-2">
                {c.label}
              </h3>
              {c.href ? (
                <a
                  href={c.href}
                  className="block text-foreground hover:text-brand transition break-all"
                >
                  {c.value}
                </a>
              ) : (
                <p className="text-foreground">{c.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Or send a <span className="text-gradient">message</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              Prefer a form? Drop your message here and we&apos;ll reply by email.
            </p>
          </div>
          <form action="#" className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Aarav Sharma"
                className="w-full rounded-lg border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@iitb.ac.in"
                className="w-full rounded-lg border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Tell us what's on your mind…"
                className="w-full rounded-lg border border-border/50 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition resize-none"
              />
            </div>
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                We&apos;ll only use your email to reply.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Send message
              </button>
            </div>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Prefer email? Write to{' '}
            <a href="mailto:support@placeai.in" className="text-brand hover:underline">
              support@placeai.in
            </a>{' '}
            directly — we read every one.
          </p>
        </div>
      </section>
    </>
  );
}
