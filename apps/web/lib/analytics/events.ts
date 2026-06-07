'use client';

import posthog from 'posthog-js';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export const analytics = {
  track(event: string, properties?: EventProperties) {
    posthog.capture(event, properties);
  },

  // Acquisition
  signupCompleted: (method: string) =>
    analytics.track('signup_completed', { method }),

  // Activation
  resumeUploaded: (fileType: string, fileSizeKb: number) =>
    analytics.track('resume_uploaded', { file_type: fileType, file_size_kb: fileSizeKb }),

  atsAnalysisCompleted: (score: number, jobTitle?: string, company?: string) =>
    analytics.track('ats_analysis_completed', { score, job_title: jobTitle, company }),

  resumeOptimized: (scoreBefore: number, scoreAfter: number) =>
    analytics.track('resume_optimized', { score_before: scoreBefore, score_after: scoreAfter }),

  // Engagement
  jobSaved: (jobId: string, source: string, matchScore?: number) =>
    analytics.track('job_saved', { job_id: jobId, source, match_score: matchScore }),

  applicationStatusChanged: (fromStatus: string, toStatus: string) =>
    analytics.track('application_status_changed', { from_status: fromStatus, to_status: toStatus }),

  interviewSessionStarted: (sessionType: string, company?: string) =>
    analytics.track('interview_session_started', { session_type: sessionType, company }),

  interviewSessionCompleted: (sessionType: string, averageScore: number) =>
    analytics.track('interview_session_completed', { session_type: sessionType, average_score: averageScore }),

  referralMessageCopied: (company: string) =>
    analytics.track('referral_message_copied', { company }),

  outreachMessageCopied: (type: string, targetCompany: string) =>
    analytics.track('outreach_message_copied', { type, target_company: targetCompany }),

  // Revenue
  upgradeClicked: (fromPage: string, plan: string) =>
    analytics.track('upgrade_clicked', { from_page: fromPage, plan }),

  paymentInitiated: (plan: string, amount: number) =>
    analytics.track('payment_initiated', { plan, amount }),

  paymentCompleted: (plan: string, amount: number, method: string) =>
    analytics.track('payment_completed', { plan, amount, payment_method: method }),

  subscriptionCancelled: (plan: string, reason?: string) =>
    analytics.track('subscription_cancelled', { plan, reason }),

  featureGatedHit: (feature: string, currentTier: string) =>
    analytics.track('feature_gated_hit', { feature, current_tier: currentTier }),
};
