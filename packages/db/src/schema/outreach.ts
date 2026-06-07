import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export type OutreachMessage = {
  step: number;
  message: string;
  sendAfterDays: number;
  subject?: string;
};

export const outreachSequences = pgTable('outreach_sequences', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  targetName: varchar('target_name', { length: 255 }),
  targetRole: varchar('target_role', { length: 255 }),
  targetCompany: varchar('target_company', { length: 500 }),
  targetLinkedinUrl: varchar('target_linkedin_url', { length: 2048 }),
  targetEmail: varchar('target_email', { length: 255 }),
  messages: jsonb('messages').$type<OutreachMessage[]>().notNull().default([]),
  status: varchar('status', { length: 50 }).default('draft'),
  currentStep: integer('current_step').default(0),
  nextSendAt: timestamp('next_send_at', { withTimezone: true }),
  responseReceived: boolean('response_received').default(false),
  responseSentiment: varchar('response_sentiment', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type OutreachSequence = typeof outreachSequences.$inferSelect;
export type NewOutreachSequence = typeof outreachSequences.$inferInsert;
