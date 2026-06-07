import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { jobs } from './jobs';

export type InterviewQuestion = {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'company_specific' | 'hr';
  expectedKeywords?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type InterviewAnswer = {
  answerText: string;
  audioUrl?: string;
  aiFeedback?: string;
  score?: number;
  improvementTips?: string[];
};

export const interviewSessions = pgTable(
  'interview_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    jobId: uuid('job_id').references(() => jobs.id),
    sessionType: varchar('session_type', { length: 50 }).notNull(),
    companyName: varchar('company_name', { length: 500 }),
    roleName: varchar('role_name', { length: 500 }),
    difficulty: varchar('difficulty', { length: 20 }).default('medium'),
    questions: jsonb('questions').$type<InterviewQuestion[]>().notNull().default([]),
    answers: jsonb('answers').$type<Record<string, InterviewAnswer>>().default({}),
    totalQuestions: integer('total_questions').default(0),
    answeredQuestions: integer('answered_questions').default(0),
    averageScore: decimal('average_score', { precision: 5, scale: 2 }),
    confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }),
    durationSeconds: integer('duration_seconds'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    overallFeedback: text('overall_feedback'),
    strengths: jsonb('strengths').$type<string[]>().default([]),
    improvements: jsonb('improvements').$type<string[]>().default([]),
    tokensUsed: integer('tokens_used'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_interview_sessions_user').on(t.userId),
    createdIdx: index('idx_interview_sessions_created').on(t.createdAt),
  }),
);

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type NewInterviewSession = typeof interviewSessions.$inferInsert;
