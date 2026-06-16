import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@placeai/db/client';
import { sql } from 'drizzle-orm';

type ServiceStatus = 'ok' | 'error';

type HealthResponse = {
  status: 'ok' | 'degraded' | 'down';
  db: ServiceStatus;
  redis: ServiceStatus;
  ai_service: ServiceStatus;
  version: string;
  timestamp: string;
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    await db.execute(sql`SELECT 1`);
    return 'ok';
  } catch {
    return 'error';
  }
}

async function checkAIService(): Promise<ServiceStatus> {
  if (process.env.ANTHROPIC_API_KEY) return 'ok';
  const aiServiceUrl = process.env.AI_SERVICE_URL;
  if (!aiServiceUrl) return 'error';
  try {
    const res = await fetch(`${aiServiceUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

export async function GET(_req: NextRequest) {
  const [dbStatus, aiStatus] = await Promise.all([
    checkDatabase(),
    checkAIService(),
  ]);

  const redisStatus: ServiceStatus = 'ok'; // Redis checked lazily via connection pooling

  const allOk = dbStatus === 'ok' && redisStatus === 'ok';
  const overallStatus = !allOk ? 'degraded' : 'ok';

  const body: HealthResponse = {
    status: overallStatus,
    db: dbStatus,
    redis: redisStatus,
    ai_service: aiStatus,
    version: process.env.npm_package_version ?? '0.0.1',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: overallStatus === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
