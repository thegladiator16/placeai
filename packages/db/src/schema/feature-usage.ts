import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const featureUsage = pgTable(
  'feature_usage',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    feature: varchar('feature', { length: 100 }).notNull(),
    tokensUsed: integer('tokens_used').default(0),
    costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userFeatureIdx: index('idx_feature_usage_user_feature').on(t.userId, t.feature),
    dateIdx: index('idx_feature_usage_date').on(t.createdAt, t.feature),
  }),
);

export type FeatureUsage = typeof featureUsage.$inferSelect;
export type NewFeatureUsage = typeof featureUsage.$inferInsert;
