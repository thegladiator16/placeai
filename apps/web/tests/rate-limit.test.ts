import { describe, it, expect, beforeEach } from 'vitest';

// Test the rate limit logic inline (no module-level side effects needed)
function makeRateLimiter() {
  const store = new Map<string, { count: number; resetAt: number }>();

  return function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1 };
    }
    entry.count++;
    return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
  };
}

describe('rate limiting logic', () => {
  it('allows requests under the limit', () => {
    const rl = makeRateLimiter();
    for (let i = 0; i < 5; i++) {
      const result = rl('user:1', 5, 60000);
      expect(result.success).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    const rl = makeRateLimiter();
    for (let i = 0; i < 5; i++) rl('user:2', 5, 60000);
    const result = rl('user:2', 5, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks separate keys independently', () => {
    const rl = makeRateLimiter();
    for (let i = 0; i < 5; i++) rl('user:3', 5, 60000);
    const otherResult = rl('user:4', 5, 60000);
    expect(otherResult.success).toBe(true);
  });

  it('allows request immediately at limit boundary', () => {
    const rl = makeRateLimiter();
    for (let i = 0; i < 4; i++) rl('user:5', 5, 60000);
    const result = rl('user:5', 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });
});
