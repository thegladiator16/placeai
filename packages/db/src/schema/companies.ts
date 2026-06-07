import {
  pgTable,
  uuid,
  varchar,
  boolean,
  smallint,
  decimal,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const companies = pgTable(
  'companies',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).unique().notNull(),
    logoUrl: varchar('logo_url', { length: 2048 }),
    website: varchar('website', { length: 2048 }),
    linkedinUrl: varchar('linkedin_url', { length: 2048 }),
    industry: varchar('industry', { length: 200 }),
    companyType: varchar('company_type', { length: 100 }),
    stage: varchar('stage', { length: 50 }),
    sizeRange: varchar('size_range', { length: 50 }),
    foundedYear: smallint('founded_year'),
    headquarters: varchar('headquarters', { length: 200 }),
    indiaOffices: jsonb('india_offices').$type<string[]>(),
    atsSystem: varchar('ats_system', { length: 100 }),
    careerPageUrl: varchar('career_page_url', { length: 2048 }),
    glassdoorRating: decimal('glassdoor_rating', { precision: 3, scale: 2 }),
    ambitionboxRating: decimal('ambitionbox_rating', { precision: 3, scale: 2 }),
    isHiring: boolean('is_hiring').default(true),
    tags: jsonb('tags').$type<string[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index('idx_companies_name').on(t.name),
    slugIdx: uniqueIndex('idx_companies_slug').on(t.slug),
  }),
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
