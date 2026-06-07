import {
  pgTable,
  uuid,
  varchar,
  smallint,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    fullName: varchar('full_name', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: varchar('avatar_url', { length: 2048 }),
    collegeName: varchar('college_name', { length: 500 }),
    graduationYear: smallint('graduation_year'),
    degree: varchar('degree', { length: 100 }),
    branch: varchar('branch', { length: 100 }),
    yearsOfExperience: smallint('years_of_experience').default(0),
    currentLocation: varchar('current_location', { length: 200 }),
    preferredLocations: jsonb('preferred_locations').$type<string[]>(),
    jobSearchStatus: varchar('job_search_status', { length: 50 }),
    targetRoles: jsonb('target_roles').$type<string[]>(),
    targetCompanies: jsonb('target_companies').$type<string[]>(),
    linkedinUrl: varchar('linkedin_url', { length: 2048 }),
    githubUrl: varchar('github_url', { length: 2048 }),
    portfolioUrl: varchar('portfolio_url', { length: 2048 }),
    onboardingCompleted: boolean('onboarding_completed').default(false),
    subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
    subscriptionStatus: varchar('subscription_status', { length: 50 }).default('active'),
    referredBy: uuid('referred_by'),
    referralCode: varchar('referral_code', { length: 20 }).unique(),
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmCampaign: varchar('utm_campaign', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    clerkIdIdx: uniqueIndex('idx_users_clerk_id').on(t.clerkId),
    collegeIdx: index('idx_users_college').on(t.collegeName),
    subscriptionIdx: index('idx_users_subscription').on(t.subscriptionTier, t.subscriptionStatus),
    jobStatusIdx: index('idx_users_job_status').on(t.jobSearchStatus),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
