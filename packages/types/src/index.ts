import { z } from 'zod';

// ── API Response Wrapper ──────────────────────────────────────────────
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};

// ── Subscription Tiers ────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = ['free', 'starter', 'pro', 'elite'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

// ── Feature Names ─────────────────────────────────────────────────────
export const FEATURE_NAMES = [
  'ats_analysis',
  'resume_ai_rewrite',
  'cover_letter_gen',
  'interview_question_gen',
  'outreach_gen',
  'referral_search',
  'resume_versions',
  'job_tracker',
] as const;
export type FeatureName = typeof FEATURE_NAMES[number];

// ── Plan Limits ───────────────────────────────────────────────────────
export type PlanLimits = {
  atsAnalysesPerMonth: number;        // -1 = unlimited
  aiRewritesPerMonth: number;
  coverLettersPerMonth: number;
  interviewSessionsPerMonth: number;
  referralSearchesPerMonth: number;
  outreachMessagesPerMonth: number;
  resumeVersions: number;
  jobTrackerSlots: number;
};

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    atsAnalysesPerMonth: 3,
    aiRewritesPerMonth: 5,
    coverLettersPerMonth: 2,
    interviewSessionsPerMonth: 2,
    referralSearchesPerMonth: 3,
    outreachMessagesPerMonth: 3,
    resumeVersions: 1,
    jobTrackerSlots: 10,
  },
  starter: {
    atsAnalysesPerMonth: 30,
    aiRewritesPerMonth: 50,
    coverLettersPerMonth: 20,
    interviewSessionsPerMonth: 10,
    referralSearchesPerMonth: 20,
    outreachMessagesPerMonth: 15,
    resumeVersions: 5,
    jobTrackerSlots: 100,
  },
  pro: {
    atsAnalysesPerMonth: -1,
    aiRewritesPerMonth: -1,
    coverLettersPerMonth: -1,
    interviewSessionsPerMonth: -1,
    referralSearchesPerMonth: -1,
    outreachMessagesPerMonth: -1,
    resumeVersions: -1,
    jobTrackerSlots: -1,
  },
  elite: {
    atsAnalysesPerMonth: -1,
    aiRewritesPerMonth: -1,
    coverLettersPerMonth: -1,
    interviewSessionsPerMonth: -1,
    referralSearchesPerMonth: -1,
    outreachMessagesPerMonth: -1,
    resumeVersions: -1,
    jobTrackerSlots: -1,
  },
};

// ── Zod Schemas ───────────────────────────────────────────────────────
export const onboardingSchema = z.object({
  fullName: z.string().min(2).max(255),
  phone: z.string().optional(),
  collegeName: z.string().min(2).max(500),
  degree: z.string().min(2).max(100),
  branch: z.string().min(2).max(100),
  graduationYear: z.number().int().min(2000).max(2030),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  currentLocation: z.string().max(200).optional(),
  preferredLocations: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetCompanies: z.array(z.string()).optional(),
  jobSearchStatus: z.enum(['actively_looking', 'open', 'not_looking']).optional(),
});

export const atsAnalyzeSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(100).max(10000),
  jobTitle: z.string().max(500).optional(),
  companyName: z.string().max(500).optional(),
});

export const applicationStatusSchema = z.enum([
  'saved', 'applied', 'awaiting_referral', 'referred',
  'application_viewed', 'phone_screen', 'technical_round',
  'hr_round', 'offer', 'rejected', 'withdrawn', 'ghosted',
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const coverLetterSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(50).max(8000),
  jobTitle: z.string().max(500).optional(),
  companyName: z.string().max(500).optional(),
  tone: z.enum(['professional', 'enthusiastic', 'concise']).default('professional'),
  customPoints: z.string().max(1000).optional(),
});

export const interviewSessionSchema = z.object({
  jobTitle: z.string().min(2).max(500),
  companyName: z.string().min(2).max(500).optional(),
  sessionType: z.enum(['behavioral', 'technical_coding', 'system_design', 'hr', 'custom']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionCount: z.number().int().min(3).max(15).default(10),
});

export const referralDiscoverSchema = z.object({
  companyName: z.string().min(2).max(500),
});

export const outreachGenerateSchema = z.object({
  type: z.enum(['linkedin_dm', 'email', 'referral_request', 'recruiter_cold']),
  targetCompany: z.string().min(2).max(500),
  targetRole: z.string().max(500).optional(),
  targetName: z.string().max(255).optional(),
  targetLinkedinUrl: z.string().url().optional(),
});
