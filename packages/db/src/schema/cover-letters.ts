import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { resumes } from './resumes';
import { jobs } from './jobs';

export const coverLetters = pgTable('cover_letters', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  resumeId: uuid('resume_id').references(() => resumes.id),
  jobId: uuid('job_id').references(() => jobs.id),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  tone: varchar('tone', { length: 50 }).default('professional'),
  tokensUsed: integer('tokens_used'),
  modelUsed: varchar('model_used', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;
