import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { resumes } from './resumes';
import { jobs } from './jobs';

export type ATSSuggestion = {
  section: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  fixSuggestion: string;
  category: string;
};

export type KeywordMatch = {
  keyword: string;
  count: number;
  importance: 'high' | 'medium' | 'low';
};

export type FormatIssue = {
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  fix: string;
};

export const atsAnalyses = pgTable(
  'ats_analyses',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    resumeId: uuid('resume_id')
      .notNull()
      .references(() => resumes.id),
    jobId: uuid('job_id').references(() => jobs.id),
    jobDescriptionRaw: text('job_description_raw'),
    jobTitle: varchar('job_title', { length: 500 }),
    companyName: varchar('company_name', { length: 500 }),
    overallScore: smallint('overall_score').notNull(),
    keywordScore: smallint('keyword_score'),
    formatScore: smallint('format_score'),
    sectionScore: smallint('section_score'),
    experienceScore: smallint('experience_score'),
    skillsScore: smallint('skills_score'),
    matchedKeywords: jsonb('matched_keywords').$type<KeywordMatch[]>().default([]),
    missingKeywords: jsonb('missing_keywords').$type<KeywordMatch[]>().default([]),
    keywordDensity: jsonb('keyword_density').$type<Record<string, number>>(),
    suggestions: jsonb('suggestions').$type<ATSSuggestion[]>().default([]),
    rewrittenBullets: jsonb('rewritten_bullets').$type<Record<string, string>>().default({}),
    formatIssues: jsonb('format_issues').$type<FormatIssue[]>().default([]),
    detectedAts: varchar('detected_ats', { length: 100 }),
    atsCompatibilityNotes: text('ats_compatibility_notes'),
    tokensUsed: integer('tokens_used'),
    modelUsed: varchar('model_used', { length: 100 }),
    processingTimeMs: integer('processing_time_ms'),
    cacheHit: boolean('cache_hit').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_ats_analyses_user').on(t.userId),
    resumeIdx: index('idx_ats_analyses_resume').on(t.resumeId),
    createdIdx: index('idx_ats_analyses_created').on(t.createdAt),
  }),
);

export type ATSAnalysis = typeof atsAnalyses.$inferSelect;
export type NewATSAnalysis = typeof atsAnalyses.$inferInsert;
