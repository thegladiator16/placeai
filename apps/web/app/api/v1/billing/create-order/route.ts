import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@placeai/db/client';
import { users } from '@placeai/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Razorpay from 'razorpay';
import type { ApiResponse } from '@placeai/types';
import { PLANS } from '@/lib/payments/plans';
import type { SubscriptionTier } from '@placeai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  tier: z.enum(['starter', 'pro', 'elite']),
  interval: z.enum(['monthly', 'annual']),
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? '',
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
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
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } } satisfies ApiResponse<never>, { status: 400 });
  }

  const { tier, interval } = parsed.data;
  const plan = PLANS[tier as SubscriptionTier];
  const amount = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `order_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      userId: user.id,
      clerkId,
      tier,
      interval,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: user.fullName ?? '',
        email: user.email,
      },
    },
  } satisfies ApiResponse<{
    orderId: string;
    amount: number | string;
    currency: string;
    keyId: string | undefined;
    prefill: { name: string; email: string };
  }>);
}
