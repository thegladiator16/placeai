import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  planId: varchar('plan_id', { length: 100 }).notNull(),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  gateway: varchar('gateway', { length: 50 }).notNull(),
  gatewaySubscriptionId: varchar('gateway_subscription_id', { length: 500 }).unique(),
  gatewayCustomerId: varchar('gateway_customer_id', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  interval: varchar('interval', { length: 20 }).notNull(),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  atsAnalysesUsed: integer('ats_analyses_used').default(0),
  aiGenerationsUsed: integer('ai_generations_used').default(0),
  interviewSessionsUsed: integer('interview_sessions_used').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable(
  'payments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    gateway: varchar('gateway', { length: 50 }).notNull(),
    gatewayPaymentId: varchar('gateway_payment_id', { length: 500 }).unique(),
    gatewayOrderId: varchar('gateway_order_id', { length: 500 }),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('INR'),
    status: varchar('status', { length: 50 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_payments_user').on(t.userId),
    gatewayIdx: index('idx_payments_gateway').on(t.gatewayPaymentId),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
