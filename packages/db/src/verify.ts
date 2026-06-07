import 'dotenv/config';
import { db } from './client';
import { users, resumes, jobs, companies } from './schema';
import { sql } from 'drizzle-orm';

async function verify(): Promise<void> {
  console.warn('🔍 Verifying database seed data...');
  let allOk = true;

  const checks: Array<{ label: string; query: Promise<Array<{ count: number }>>; min: number }> = [
    { label: 'Users', query: db.select({ count: sql<number>`count(*)::int` }).from(users), min: 1 },
    { label: 'Resumes', query: db.select({ count: sql<number>`count(*)::int` }).from(resumes), min: 1 },
    { label: 'Jobs', query: db.select({ count: sql<number>`count(*)::int` }).from(jobs), min: 50 },
    { label: 'Companies', query: db.select({ count: sql<number>`count(*)::int` }).from(companies), min: 5 },
  ];

  for (const check of checks) {
    const result = await check.query;
    const count = result[0]?.count ?? 0;
    const ok = count >= check.min;
    console.warn(`  ${ok ? '✅' : '❌'} ${check.label}: ${count} rows (min: ${check.min})`);
    if (!ok) allOk = false;
  }

  if (allOk) {
    console.warn('\n✅ All checks passed!');
    process.exit(0);
  } else {
    console.warn('\n❌ Some checks failed. Run db:seed to populate missing data.');
    process.exit(1);
  }
}

verify().catch((err: unknown) => {
  console.error('Verify failed:', err);
  process.exit(1);
});
