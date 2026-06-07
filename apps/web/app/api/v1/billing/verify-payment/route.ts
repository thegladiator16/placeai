import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users, subscriptions, payments } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createHmac } from 'crypto';
import type { ApiResponse } from '@placeai/types';
import type { SubscriptionTier } from '@placeai/types';
import { PLANS } from '@/lib/payments/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  tier: z.enum(['starter', 'pro', 'elite']),
  interval: z.enum(['monthly', 'annual']),
});

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } satisfies ApiResponse<never>, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } } satisfies ApiResponse<never>, { status: 404 });
  }

  const body = await req.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, interval } = parsed.data;

  // Verify signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  const expectedSig = createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification failed' } } satisfies ApiResponse<never>, { status: 400 });
  }

  const plan = PLANS[tier as SubscriptionTier];
  const amount = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  const now = new Date();
  const periodEnd = new Date(now);
  if (interval === 'annual') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Save subscription + payment + update user tier in parallel
  await Promise.all([
    db.insert(subscriptions).values({
      userId: user.id,
      planId: `${tier}_${interval}`,
      planName: plan.name,
      gateway: 'razorpay',
      gatewaySubscriptionId: razorpay_order_id,
      status: 'active',
      amount,
      currency: 'INR',
      interval,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    }).onConflictDoNothing(),
    db.insert(payments).values({
      userId: user.id,
      gateway: 'razorpay',
      gatewayPaymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      amount,
      currency: 'INR',
      status: 'captured',
      paymentMethod: 'razorpay',
    }).onConflictDoNothing(),
    db.update(users).set({
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      updatedAt: now,
    }).where(eq(users.id, user.id)),
  ]);

  return NextResponse.json({ success: true, data: { tier, redirectUrl: '/dashboard?upgraded=1' } } satisfies ApiResponse<{ tier: string; redirectUrl: string }>);
}
