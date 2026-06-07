import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';

export const referralContacts = pgTable(
  'referral_contacts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id').references(() => companies.id),
    contactName: varchar('contact_name', { length: 255 }).notNull(),
    contactRole: varchar('contact_role', { length: 255 }),
    contactLinkedinUrl: varchar('contact_linkedin_url', { length: 2048 }),
    contactEmail: varchar('contact_email', { length: 255 }),
    contactCompany: varchar('contact_company', { length: 500 }),
    connectionType: varchar('connection_type', { length: 100 }),
    collegeMatch: boolean('college_match').default(false),
    graduationYearMatch: boolean('graduation_year_match').default(false),
    outreachMessage: text('outreach_message'),
    messageSentAt: timestamp('message_sent_at', { withTimezone: true }),
    responseReceived: boolean('response_received').default(false),
    responseAt: timestamp('response_at', { withTimezone: true }),
    referralGiven: boolean('referral_given').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('idx_referral_contacts_user').on(t.userId),
    companyIdx: index('idx_referral_contacts_company').on(t.companyId),
  }),
);

export type ReferralContact = typeof referralContacts.$inferSelect;
export type NewReferralContact = typeof referralContacts.$inferInsert;
