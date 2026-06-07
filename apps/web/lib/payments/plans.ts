import type { SubscriptionTier, PlanLimits } from '@placeai/types';
import { PLAN_LIMITS } from '@placeai/types';

export type PlanConfig = {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: number;      // in INR paise
  priceAnnual: number;       // total annual price in paise
  currency: 'INR';
  interval: 'monthly' | 'annual';
  limits: PlanLimits;
  features: string[];
  isPopular?: boolean;
  razorpayPlanIdMonthly?: string | undefined;
  razorpayPlanIdAnnual?: string | undefined;
  stripePriceIdMonthly?: string | undefined;
  stripePriceIdAnnual?: string | undefined;
};

export const PLANS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    id: 'free',
    tier: 'free',
    name: 'Free',
    tagline: 'Get started, no card needed',
    priceMonthly: 0,
    priceAnnual: 0,
    currency: 'INR',
    interval: 'monthly',
    limits: PLAN_LIMITS.free,
    features: [
      '3 ATS analyses total',
      '5 AI rewrites',
      '2 cover letters',
      '2 mock interviews',
      '10-job tracker',
      '1 resume version',
    ],
  },
  starter: {
    id: 'starter',
    tier: 'starter',
    name: 'Starter',
    tagline: 'For active job seekers',
    priceMonthly: 29900,     // ₹299 in paise
    priceAnnual: 249900,     // ₹2,499 in paise (~₹208/mo)
    currency: 'INR',
    interval: 'monthly',
    limits: PLAN_LIMITS.starter,
    features: [
      '30 ATS analyses/month',
      '50 AI rewrites/month',
      '20 cover letters/month',
      '10 mock interviews/month',
      'Unlimited job tracker',
      '5 resume versions',
      'LinkedIn optimizer',
      '20 referral searches/month',
    ],
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY,
    razorpayPlanIdAnnual: process.env.RAZORPAY_PLAN_STARTER_ANNUAL,
  },
  pro: {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    tagline: 'Unlimited, priority AI queue',
    priceMonthly: 69900,     // ₹699
    priceAnnual: 599900,     // ₹5,999
    currency: 'INR',
    interval: 'monthly',
    limits: PLAN_LIMITS.pro,
    isPopular: true,
    features: [
      'Everything in Starter',
      'Unlimited ATS analyses',
      'Unlimited AI generation',
      'Priority AI queue',
      'Unlimited resume versions',
      'Unlimited referral searches',
      'Advanced analytics',
    ],
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    razorpayPlanIdAnnual: process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  },
  elite: {
    id: 'elite',
    tier: 'elite',
    name: 'Elite',
    tagline: 'Full placement copilot',
    priceMonthly: 99900,     // ₹999
    priceAnnual: 899900,     // ₹8,999
    currency: 'INR',
    interval: 'monthly',
    limits: PLAN_LIMITS.elite,
    features: [
      'Everything in Pro',
      'AI Voice Mock Interviews',
      'Career Coach Chat',
      'Salary negotiation scripts',
      'Live Interview Copilot (beta)',
      'Priority support',
    ],
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_ELITE_MONTHLY,
    razorpayPlanIdAnnual: process.env.RAZORPAY_PLAN_ELITE_ANNUAL,
  },
};

export function getPlanByTier(tier: SubscriptionTier): PlanConfig {
  return PLANS[tier];
}

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}
