import { NextResponse } from 'next/server';
import type { ApiResponse } from '@placeai/types';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function err(code: string, message: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, details } } satisfies ApiResponse<never>,
    { status },
  );
}

export const Errors = {
  unauthorized: () => err('UNAUTHORIZED', 'Not authenticated', 401),
  forbidden: () => err('FORBIDDEN', 'Insufficient permissions', 403),
  notFound: (resource = 'Resource') => err('NOT_FOUND', `${resource} not found`, 404),
  badRequest: (message: string, details?: unknown) => err('BAD_REQUEST', message, 400, details),
  quotaExceeded: (reason: string, upsellTier?: string) =>
    err('QUOTA_EXCEEDED', reason, 429, { upsellTier }),
  internal: () => err('INTERNAL_ERROR', 'Something went wrong', 500),
};
