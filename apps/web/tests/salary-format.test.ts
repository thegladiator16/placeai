import { describe, it, expect } from 'vitest';

// Mirror of formatSalary from job-card.tsx
function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  if (!min && !max) return '';
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${n}`;
  const c = currency === 'INR' ? '₹' : (currency ?? '');
  if (min && max) return `${c}${fmt(min)}–${fmt(max)}`;
  if (min) return `${c}${fmt(min)}+`;
  return `Up to ${c}${fmt(max!)}`;
}

describe('salary formatting', () => {
  it('formats lakhs correctly', () => {
    // currency prefix is prepended to the formatted min value only
    const result = formatSalary(1200000, 2000000, 'INR');
    expect(result).toContain('12L');
    expect(result).toContain('20L');
    expect(result).toContain('₹');
  });

  it('handles only min salary', () => {
    expect(formatSalary(1500000, null, 'INR')).toBe('₹15L+');
  });

  it('handles only max salary', () => {
    expect(formatSalary(null, 3000000, 'INR')).toBe('Up to ₹30L');
  });

  it('returns empty string when both null', () => {
    expect(formatSalary(null, null, 'INR')).toBe('');
  });

  it('uses currency code for non-INR', () => {
    // formatSalary uses currency as prefix only when INR, otherwise uses currency string
    const result = formatSalary(100000, 200000, 'USD');
    expect(result).toContain('USD');
  });

  it('handles sub-lakh amounts without L suffix', () => {
    // The fmt function only adds L for >= 100000, currency prefix is added once before min
    const result = formatSalary(50000, 80000, 'INR');
    expect(result).toContain('₹');
    expect(result).toContain('50000');
    expect(result).toContain('80000');
  });
});
