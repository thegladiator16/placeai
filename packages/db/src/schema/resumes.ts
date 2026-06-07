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
import { users } from './users';

export type PersonalInfo = {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
};

export type EducationEntry = {
  institution: string;
  degree: string;
  branch?: string;
  gpa?: string;
  startDate?: string;
  endDate?: string;
  courses?: string[];
  achievements?: string[];
};

export type ExperienceEntry = {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  isCurrent?: boolean;
  bullets: string[];
  technologies?: string[];
};

export type ProjectEntry = {
  name: string;
  description?: string;
  url?: string;
  repoUrl?: string;
  technologies?: string[];
  bullets?: string[];
  startDate?: string;
  endDate?: string;
};

export type Skills = {
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  databases?: string[];
  cloud?: string[];
  other?: string[];
};

export type CertificationEntry = {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
};

export const resumes = pgTable(
  'resumes',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull().default('My Resume'),
    isPrimary: boolean('is_primary').default(false),
    version: integer('version').default(1),
    personalInfo: jsonb('personal_info').$type<PersonalInfo>().notNull().default({} as PersonalInfo),
    summary: text('summary'),
    education: jsonb('education').$type<EducationEntry[]>().notNull().default([]),
    experience: jsonb('experience').$type<ExperienceEntry[]>().notNull().default([]),
    projects: jsonb('projects').$type<ProjectEntry[]>().notNull().default([]),
    skills: jsonb('skills').$type<Skills>().notNull().default({}),
    certifications: jsonb('certifications').$type<CertificationEntry[]>().default([]),
    achievements: jsonb('achievements').$type<string[]>().default([]),
    publications: jsonb('publications').$type<unknown[]>().default([]),
    languages: jsonb('languages').$type<string[]>().default([]),
    rawText: text('raw_text'),
    fileUrl: varchar('file_url', { length: 2048 }),
    fileName: varchar('file_name', { length: 500 }),
    fileSizeBytes: integer('file_size_bytes'),
    atsScore: smallint('ats_score'),
    readabilityScore: smallint('readability_score'),
    keywordDensity: jsonb('keyword_density').$type<Record<string, number>>(),
    extractedSkills: jsonb('extracted_skills').$type<string[]>(),
    templateId: varchar('template_id', { length: 100 }),
    templateConfig: jsonb('template_config').$type<Record<string, unknown>>().default({}),
    status: varchar('status', { length: 50 }).default('draft'),
    wordCount: integer('word_count'),
    pageCount: smallint('page_count'),
    lastAtsAnalyzedAt: timestamp('last_ats_analyzed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index('idx_resumes_user_id').on(t.userId),
    primaryIdx: index('idx_resumes_primary').on(t.userId, t.isPrimary),
    statusIdx: index('idx_resumes_status').on(t.status),
  }),
);

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
