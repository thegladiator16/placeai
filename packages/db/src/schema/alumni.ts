import {
  pgTable,
  uuid,
  varchar,
  smallint,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const alumniIndex = pgTable(
  'alumni_index',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    collegeName: varchar('college_name', { length: 500 }).notNull(),
    collegeNormalized: varchar('college_normalized', { length: 500 }).notNull(),
    personName: varchar('person_name', { length: 255 }),
    linkedinUrl: varchar('linkedin_url', { length: 2048 }),
    currentCompany: varchar('current_company', { length: 500 }),
    currentRole: varchar('current_role', { length: 500 }),
    graduationYear: smallint('graduation_year'),
    branch: varchar('branch', { length: 100 }),
    isVerified: boolean('is_verified').default(false),
    dataSource: varchar('data_source', { length: 100 }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    collegeIdx: index('idx_alumni_college').on(t.collegeNormalized),
    companyIdx: index('idx_alumni_company').on(t.currentCompany),
    collegeCompanyIdx: index('idx_alumni_college_company').on(
      t.collegeNormalized,
      t.currentCompany,
    ),
  }),
);

export type AlumniEntry = typeof alumniIndex.$inferSelect;
export type NewAlumniEntry = typeof alumniIndex.$inferInsert;
