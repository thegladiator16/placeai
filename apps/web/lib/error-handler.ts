export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message?: string,
    public details?: unknown,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): {
  statusCode: number;
  code: string;
  message: string;
  details: unknown;
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    };
  }

  if (error instanceof Error) {
    // Log full error server-side but never expose internals to clients
    console.error('[API Error]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: null,
    };
  }

  console.error('[API Error] Unknown error type:', error);
  return {
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: null,
  };
}

export const Errors = {
  unauthorized: () => new AppError(401, 'UNAUTHORIZED', 'Not authenticated'),
  forbidden: () => new AppError(403, 'FORBIDDEN', 'Access denied'),
  notFound: (resource = 'Resource') => new AppError(404, 'NOT_FOUND', `${resource} not found`),
  validation: (msg: string) => new AppError(400, 'VALIDATION_ERROR', msg),
  featureGated: (feature: string) => new AppError(403, 'FEATURE_GATED', `${feature} requires a paid plan`),
  rateLimited: () => new AppError(429, 'RATE_LIMITED', 'Too many requests. Please slow down.'),
} as const;
