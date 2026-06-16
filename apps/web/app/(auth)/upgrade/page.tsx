import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Check } from 'lucide-react';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { PLANS, formatINR } from '@/lib/payments/plans';

export const metadata: Metadata = { title: 'Confirm upgrade — PlaceAI' };

type PaidTier = 'starter' | 'pro' | 'elite';
const VALID_PAID_TIERS: readonly PaidTier[] = ['starter', 'pro', 'elite'] as const;
const VALID_INTERVALS = ['monthly', 'annual'] as const;
type Interval = (typeof VALID_INTERVALS)[number];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) redirect('/sign-in');

  const { plan, interval } = await searchParams;

  // Free is the default — no need to "upgrade" into it
  if (plan === 'free') redirect('/dashboard');

  const isValidPlan = (p: string | undefined): p is PaidTier =>
    !!p && (VALID_PAID_TIERS as readonly string[]).includes(p);
  const isValidInterval = (i: string | undefined): i is Interval =>
    !!i && (VALID_INTERVALS as readonly string[]).includes(i);

  if (!isValidPlan(plan) || !isValidInterval(interval)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-display font-bold text-foreground">Plan not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We could not find the plan you were trying to upgrade to. Pick one from our pricing page
            and try again.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
          >
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  const config = PLANS[plan];
  const price = interval === 'annual' ? config.priceAnnual : config.priceMonthly;
  const intervalLabel = interval === 'annual' ? '/year' : '/month';
  const features = config.features.slice(0, 6);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Confirm your upgrade
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground mt-2">
            {config.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{config.tagline}</p>

          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-display font-bold text-foreground">
              {formatINR(price)}
            </span>
            <span className="text-muted-foreground text-sm">{intervalLabel}</span>
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
              <Check className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          <button
            disabled
            className="w-full px-5 py-3 rounded-lg bg-brand text-white font-medium opacity-60 cursor-not-allowed"
          >
            Razorpay checkout coming soon
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Payments launching next week — your account is already activated for testing.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to plans
          </Link>
        </div>
      </div>
    </div>
  );
}
