import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  smallint,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { companies } from './companies';

export type JobLocation = {
  city?: string;
  state?: string;
  country?: string;
  isRemote?: boolean;
};

export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    source: varchar('source', { length: 100 }).notNull(),
    sourceJobId: varchar('source_job_id', { length: 500 }),
    sourceUrl: varchar('source_url', { length: 2048 }),
    title: varchar('title', { length: 500 }).notNull(),
    companyName: varchar('company_name', { length: 500 }).notNull(),
    companyId: uuid('company_id').references(() => companies.id),
    locations: jsonb('locations').$type<JobLocation[]>().notNull().default([]),
    workMode: varchar('work_mode', { length: 50 }),
    employmentType: varchar('employment_type', { length: 50 }),
    experienceMin: smallint('experience_min'),
    experienceMax: smallint('experience_max'),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    salaryCurrency: varchar('salary_currency', { length: 10 }).default('INR'),
    description: text('description').notNull(),
    requirements: text('requirements'),
    responsibilities: text('responsibilities'),
    benefits: text('benefits'),
    requiredSkills: jsonb('required_skills').$type<string[]>().default([]),
    preferredSkills: jsonb('preferred_skills').$type<string[]>().default([]),
    requiredEducation: jsonb('required_education').$type<Record<string, unknown>>().default({}),
    keywords: jsonb('keywords').$type<string[]>().default([]),
    atsType: varchar('ats_type', { length: 100 }),
    department: varchar('department', { length: 200 }),
    teamSize: varchar('team_size', { length: 50 }),
    companyStage: varchar('company_stage', { length: 50 }),
    companySize: varchar('company_size', { length: 50 }),
    industry: varchar('industry', { length: 200 }),
    isActive: boolean('is_active').default(true),
    postedAt: timestamp('posted_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index('idx_jobs_company').on(t.companyName),
    titleIdx: index('idx_jobs_title').on(t.title),
    sourceIdx: index('idx_jobs_source').on(t.source, t.sourceJobId),
    activeIdx: index('idx_jobs_active').on(t.isActive, t.postedAt),
  }),
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
