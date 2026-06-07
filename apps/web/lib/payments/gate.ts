import { db } from '@placeai/db/client';
import { users, featureUsage } from '@placeai/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { PLAN_LIMITS } from '@placeai/types';
import type { FeatureName, SubscriptionTier } from '@placeai/types';

type GateResult = {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  upsellTier?: SubscriptionTier;
};

const FEATURE_TO_LIMIT_KEY: Record<FeatureName, keyof typeof PLAN_LIMITS['free']> = {
  ats_analysis: 'atsAnalysesPerMonth',
  resume_ai_rewrite: 'aiRewritesPerMonth',
  cover_letter_gen: 'coverLettersPerMonth',
  interview_question_gen: 'interviewSessionsPerMonth',
  outreach_gen: 'outreachMessagesPerMonth',
  referral_search: 'referralSearchesPerMonth',
  resume_versions: 'resumeVersions',
  job_tracker: 'jobTrackerSlots',
};

export async function checkFeatureAccess(
  userId: string,
  feature: FeatureName,
): Promise<GateResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { subscriptionTier: true, subscriptionStatus: true },
  });

  if (!user) return { allowed: false, reason: 'User not found' };

  const tier = (user.subscriptionTier ?? 'free') as SubscriptionTier;
  const limits = PLAN_LIMITS[tier];
  const limitKey = FEATURE_TO_LIMIT_KEY[feature];
  const limit = limits[limitKey] as number;

  if (limit === -1) return { allowed: true };

  // Count usage this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [usage] = await db
    .select({ count: count() })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.feature, feature),
        gte(featureUsage.createdAt, monthStart),
      ),
    );

  const used = usage?.count ?? 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    const nextTier: SubscriptionTier = tier === 'free' ? 'starter' : tier === 'starter' ? 'pro' : 'elite';
    return {
      allowed: false,
      reason: `You've used ${used}/${limit} ${feature.replace(/_/g, ' ')}s this month.`,
      remaining: 0,
      upsellTier: nextTier,
    };
  }

  return { allowed: true, remaining };
}

export async function recordFeatureUsage(
  userId: string,
  feature: FeatureName,
  tokensUsed = 0,
  costUsd = 0,
): Promise<void> {
  await db.insert(featureUsage).values({
    userId,
    feature,
    tokensUsed,
    costUsd: costUsd.toString(),
  });
}
