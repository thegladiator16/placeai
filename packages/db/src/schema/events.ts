import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const events = pgTable(
  'events',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id').references(() => users.id),
    sessionId: varchar('session_id', { length: 255 }),
    eventName: varchar('event_name', { length: 200 }).notNull(),
    properties: jsonb('properties').$type<Record<string, unknown>>().default({}),
    pageUrl: text('page_url'),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_events_user').on(t.userId),
    nameIdx: index('idx_events_name').on(t.eventName, t.createdAt),
    sessionIdx: index('idx_events_session').on(t.sessionId),
  }),
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
