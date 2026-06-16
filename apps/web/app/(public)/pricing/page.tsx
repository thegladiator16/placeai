import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { PLANS, formatINR } from '@/lib/payments/plans';

export const metadata: Metadata = {
  title: 'Pricing — PlaceAI',
  description:
    'Simple, honest pricing for Indian engineering students. Free, Pro at ₹299/mo, Premium at ₹999/mo. Cancel anytime.',
};

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel in one click from Settings. We refund unused days on a pro-rata basis — no questions asked.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Our pricing is already 90% lower than US tools like Teal or Jobscan. ₹299 ≈ $3.50 — built for Indian students.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'UPI, credit/debit cards, net banking, and wallets via Razorpay. International cards welcome.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes. Upgrade or downgrade anytime from Settings → Billing. Pro-rata charges apply for upgrades.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free tier is permanent — no credit card required. Pro and Premium give you 7 days free on first signup.',
  },
  {
    q: 'What if Claude or AI generation fails?',
    a: 'You get a refund or month extension if AI features are down for more than 24 hours. We monitor 24/7.',
  },
];

type Tier = {
  key: 'free' | 'pro' | 'premium';
  name: string;
  tagline: string;
  priceMonthlyPaise: number;
  priceAnnualPaise: number;
  features: string[];
  popular?: boolean;
};

const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Get started, no card needed',
    priceMonthlyPaise: 0,
    priceAnnualPaise: 0,
    features: PLANS.free.features,
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For active job seekers',
    priceMonthlyPaise: PLANS.starter.priceMonthly,
    priceAnnualPaise: PLANS.starter.priceAnnual,
    features: PLANS.starter.features,
    popular: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    tagline: 'Unlimited everything',
    priceMonthlyPaise: PLANS.elite.priceMonthly,
    priceAnnualPaise: PLANS.elite.priceAnnual,
    features: PLANS.elite.features,
  },
];

const COMPARISON = [
  { label: 'ATS analyses', free: '3 total', pro: '30 / month', premium: 'Unlimited' },
  { label: 'AI bullet rewrites', free: '5', pro: '50 / month', premium: 'Unlimited' },
  { label: 'Cover letters', free: '2', pro: '20 / month', premium: 'Unlimited' },
  { label: 'Mock interviews', free: '2', pro: '10 / month', premium: 'Unlimited' },
  { label: 'Job tracker capacity', free: '10 jobs', pro: 'Unlimited', premium: 'Unlimited' },
  { label: 'Resume versions', free: '1', pro: '5', premium: 'Unlimited' },
  { label: 'Referral searches', free: false, pro: '20 / month', premium: 'Unlimited' },
  { label: 'LinkedIn optimizer', free: false, pro: true, premium: true },
  { label: 'Priority AI queue', free: false, pro: false, premium: true },
  { label: 'AI voice mock interviews', free: false, pro: false, premium: true },
  { label: 'Career coach chat', free: false, pro: false, premium: true },
  { label: 'Salary negotiation scripts', free: false, pro: false, premium: true },
  { label: 'Live interview copilot (beta)', free: false, pro: false, premium: true },
];

function cellValue(value: string | boolean) {
  if (value === true) return <Check className="h-5 w-5 text-accent" aria-label="Included" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground/40" aria-label="Not included" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Simple, <span className="text-gradient">honest pricing</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Built for Indian students. Pay in ₹. No surprise charges. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={
                'relative rounded-2xl border bg-card p-8 flex flex-col ' +
                (tier.popular
                  ? 'border-brand shadow-[0_0_40px_rgba(108,71,255,0.15)]'
                  : 'border-border/50')
              }
            >
              {tier.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most popular
                </span>
              ) : null}
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold text-foreground">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.tagline}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-foreground">
                    {tier.priceMonthlyPaise === 0 ? '₹0' : formatINR(tier.priceMonthlyPaise)}
                  </span>
                  <span className="text-muted-foreground">
                    {tier.priceMonthlyPaise === 0 ? '/forever' : '/month'}
                  </span>
                </div>
                {tier.priceAnnualPaise > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    or {formatINR(tier.priceAnnualPaise)}/year — save{' '}
                    {Math.round(
                      ((tier.priceMonthlyPaise * 12 - tier.priceAnnualPaise) /
                        (tier.priceMonthlyPaise * 12)) *
                        100,
                    )}
                    %
                  </p>
                ) : null}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={
                  'inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition ' +
                  (tier.popular
                    ? 'bg-brand text-white hover:bg-brand-dark'
                    : 'bg-secondary text-foreground hover:bg-secondary/80')
                }
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Compare <span className="text-gradient">every feature</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              See exactly what you get on each plan.
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-4 bg-secondary/30 px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
              <div className="text-center">Premium</div>
            </div>
            <div className="divide-y divide-border/50">
              {COMPARISON.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-4 px-6 py-4 items-center hover:bg-secondary/10 transition"
                >
                  <div className="text-sm text-foreground/90">{row.label}</div>
                  <div className="flex justify-center">{cellValue(row.free)}</div>
                  <div className="flex justify-center">{cellValue(row.pro)}</div>
                  <div className="flex justify-center">{cellValue(row.premium)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Frequently asked <span className="text-gradient">questions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <h3 className="font-display font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Start your free trial <span className="text-gradient">today</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            No credit card. No commitments. Cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-8 py-4 text-base font-medium text-white hover:bg-brand-dark transition"
          >
            Start free — no card required
          </Link>
        </div>
      </section>
    </>
  );
}
