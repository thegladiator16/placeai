import { describe, it, expect } from 'vitest';

// Mirror of timeAgo from job-card.tsx
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

describe('timeAgo', () => {
  it('returns empty string for null', () => {
    expect(timeAgo(null)).toBe('');
  });

  it('returns Today for today', () => {
    expect(timeAgo(new Date().toISOString())).toBe('Today');
  });

  it('returns Yesterday for 1 day ago', () => {
    const d = new Date(Date.now() - 86400000);
    expect(timeAgo(d.toISOString())).toBe('Yesterday');
  });

  it('returns Nd ago for recent days', () => {
    const d = new Date(Date.now() - 3 * 86400000);
    expect(timeAgo(d.toISOString())).toBe('3d ago');
  });

  it('returns Nw ago for weeks', () => {
    const d = new Date(Date.now() - 14 * 86400000);
    expect(timeAgo(d.toISOString())).toBe('2w ago');
  });

  it('returns Nmo ago for months', () => {
    const d = new Date(Date.now() - 35 * 86400000);
    expect(timeAgo(d.toISOString())).toBe('1mo ago');
  });
});
