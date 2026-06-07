// In-memory rate limiter (use Upstash Redis in production for multi-instance deployments)
const store = new Map<string, { count: number; resetAt: number }>();

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export function rateLimit(key: string, { limit, windowMs }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, newEntry);
    return { success: true, limit, remaining: limit - 1, reset: newEntry.resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return {
    success: entry.count <= limit,
    limit,
    remaining,
    reset: entry.resetAt,
  };
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export const RATE_LIMITS = {
  ats: { limit: 10, windowMs: 60 * 60 * 1000 },       // 10 per hour
  ai: { limit: 30, windowMs: 60 * 60 * 1000 },         // 30 per hour
  referral: { limit: 20, windowMs: 60 * 60 * 1000 },   // 20 per hour
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },       // 10 per 15min
  default: { limit: 100, windowMs: 60 * 60 * 1000 },   // 100 per hour
} as const;
