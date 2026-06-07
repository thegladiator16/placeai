import {
  pgTable,
  uuid,
  varchar,
  integer,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const aiCache = pgTable(
  'ai_cache',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    cacheKey: varchar('cache_key', { length: 500 }).unique().notNull(),
    response: jsonb('response').notNull(),
    tokensSaved: integer('tokens_saved'),
    hitCount: integer('hit_count').default(1),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    cacheKeyIdx: uniqueIndex('idx_ai_cache_key').on(t.cacheKey),
    expiresIdx: index('idx_ai_cache_expires').on(t.expiresAt),
  }),
);

export type AICache = typeof aiCache.$inferSelect;
export type NewAICache = typeof aiCache.$inferInsert;
