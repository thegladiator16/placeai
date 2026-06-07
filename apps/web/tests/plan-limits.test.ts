import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS } from '@placeai/types';

describe('plan limits correctness', () => {
  it('free tier is most restrictive', () => {
    const tiers = ['starter', 'pro', 'elite'] as const;
    for (const tier of tiers) {
      const freeAts = PLAN_LIMITS.free.atsAnalysesPerMonth;
      const tierAts = PLAN_LIMITS[tier].atsAnalysesPerMonth;
      if (freeAts > 0 && tierAts > 0) {
        expect(tierAts).toBeGreaterThanOrEqual(freeAts);
      }
    }
  });

  it('elite tier has -1 (unlimited) for all limits', () => {
    const values = Object.values(PLAN_LIMITS.elite) as number[];
    expect(values.every((v) => v === -1)).toBe(true);
  });

  it('free tier has positive limits (not -1)', () => {
    const atsLimit = PLAN_LIMITS.free.atsAnalysesPerMonth;
    expect(atsLimit).toBeGreaterThan(0);
  });

  it('pro tier has more ATS analyses than starter', () => {
    const starter = PLAN_LIMITS.starter.atsAnalysesPerMonth;
    const pro = PLAN_LIMITS.pro.atsAnalysesPerMonth;
    if (starter > 0 && pro > 0) {
      expect(pro).toBeGreaterThan(starter);
    } else {
      // pro is -1 (unlimited) which is fine
      expect(pro).toBe(-1);
    }
  });
});

describe('formatINR utility', () => {
  it('formats paise to rupees', async () => {
    const { formatINR } = await import('@/lib/payments/plans');
    expect(formatINR(29900)).toBe('₹299');
    expect(formatINR(99900)).toBe('₹999');
    expect(formatINR(199900)).toBe('₹1,999');
  });
});
