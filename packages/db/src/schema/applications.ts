import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  smallint,
  integer,
  jsonb,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { jobs } from './jobs';
import { resumes } from './resumes';

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id').references(() => jobs.id),
    companyName: varchar('company_name', { length: 500 }),
    jobTitle: varchar('job_title', { length: 500 }),
    jobUrl: varchar('job_url', { length: 2048 }),
    resumeId: uuid('resume_id').references(() => resumes.id),
    coverLetterId: uuid('cover_letter_id'),
    atsMatchScore: smallint('ats_match_score'),
    atsAnalysisSnapshot: jsonb('ats_analysis_snapshot').$type<Record<string, unknown>>(),
    status: varchar('status', { length: 100 }).notNull().default('saved'),
    priority: varchar('priority', { length: 20 }).default('medium'),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow(),
    appliedAt: timestamp('applied_at', { withTimezone: true }),
    statusChangedAt: timestamp('status_changed_at', { withTimezone: true }).defaultNow(),
    followUpDate: date('follow_up_date'),
    nextAction: varchar('next_action', { length: 500 }),
    notes: text('notes'),
    salaryExpectation: integer('salary_expectation'),
    referralContactId: uuid('referral_contact_id'),
    referralRequestedAt: timestamp('referral_requested_at', { withTimezone: true }),
    referralConfirmed: boolean('referral_confirmed').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_applications_user').on(t.userId),
    statusIdx: index('idx_applications_status').on(t.userId, t.status),
    appliedIdx: index('idx_applications_applied').on(t.appliedAt),
  }),
);

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
