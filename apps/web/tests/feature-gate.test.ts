import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PLAN_LIMITS } from '@placeai/types';

describe('PLAN_LIMITS', () => {
  it('free tier has limited ATS analyses', () => {
    expect(PLAN_LIMITS.free.atsAnalysesPerMonth).toBe(3);
  });

  it('pro tier has unlimited ATS analyses', () => {
    expect(PLAN_LIMITS.pro.atsAnalysesPerMonth).toBe(-1);
  });

  it('starter tier has limited cover letters', () => {
    expect(PLAN_LIMITS.starter.coverLettersPerMonth).toBe(20);
  });

  it('elite tier has unlimited everything', () => {
    const limits = PLAN_LIMITS.elite;
    const keys = Object.values(limits) as number[];
    expect(keys.every((v) => v === -1)).toBe(true);
  });
});

describe('formatINR', () => {
  it('converts paise to INR string correctly', async () => {
    const { formatINR } = await import('@/lib/payments/plans');
    expect(formatINR(29900)).toBe('₹299');
    expect(formatINR(99900)).toBe('₹999');
    expect(formatINR(0)).toBe('₹0');
  });
});
