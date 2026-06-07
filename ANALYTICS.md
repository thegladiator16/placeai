# PlaceAI Analytics Setup

Analytics are powered by **PostHog** (self-hosted or cloud).

## Configuration

Set in `.env.local`:

```env
NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## Events to Track

All events are sent via PostHog's JS SDK, which is already wired up in `app/posthog-provider.tsx`.

### Acquisition

| Event | When | Properties |
|---|---|---|
| `signup_started` | User clicks sign up | `{ method: 'email' \| 'google' \| 'github' }` |
| `signup_completed` | Clerk user.created webhook fires | `{ method }` |
| `onboarding_completed` | POST /api/v1/auth/onboard succeeds | `{ college, degree, target_roles }` |

### Activation

| Event | When | Properties |
|---|---|---|
| `resume_uploaded` | Resume upload API succeeds | `{ file_type: 'pdf' \| 'docx', size_kb }` |
| `ats_analysis_completed` | ATS analysis returns score | `{ score, job_keywords_count, plan }` |
| `first_job_saved` | First job saved in tracker | `{ company, role }` |
| `first_application_created` | First application status set | `{ company, status }` |

### Engagement (Daily Active Features)

| Event | When | Properties |
|---|---|---|
| `ats_analysis_run` | User clicks Analyze | `{ score, resume_id }` |
| `interview_session_started` | Interview session created | `{ session_type, company, difficulty }` |
| `interview_session_completed` | All answers submitted | `{ avg_score, questions_count, duration_s }` |
| `job_application_status_changed` | Kanban card dragged | `{ from_status, to_status, company }` |
| `referral_message_generated` | Generate message clicked | `{ connection_strength, company }` |
| `outreach_message_copied` | Copy button clicked | `{ step: 1 \| 2 \| 3, channel }` |
| `cover_letter_generated` | Streaming completes | `{ tone, company, has_resume }` |

### Monetization

| Event | When | Properties |
|---|---|---|
| `upgrade_clicked` | Upgrade CTA clicked | `{ source: 'banner' \| 'feature_gate' \| 'pricing' }` |
| `payment_initiated` | Razorpay order created | `{ plan, amount_inr }` |
| `payment_completed` | Webhook verified payment | `{ plan, amount_inr, mrr_delta }` |
| `subscription_cancelled` | Subscription cancelled | `{ plan, tenure_days }` |

### Errors

| Event | When | Properties |
|---|---|---|
| `api_error` | API returns 4xx/5xx | `{ endpoint, status_code, code }` |
| `feature_limit_hit` | User hits plan limit | `{ feature, plan }` |
| `payment_failed` | Razorpay returns failure | `{ plan, reason }` |

---

## PostHog Dashboards to Create

### 1. Acquisition Funnel

Steps: `signup_started → signup_completed → onboarding_completed → resume_uploaded → ats_analysis_completed`

Target conversion: >40% of signups complete onboarding.

### 2. Paid Conversion

Steps: `upgrade_clicked → payment_initiated → payment_completed`

Target: >15% of upgrade clicks convert to paid.

### 3. Feature Adoption

Breakdown by feature usage per week. Identify stickiest features (likely ATS + Interview Prep).

### 4. Retention Cohorts

Day 1 / Day 7 / Day 30 retention by signup week.

Target: Day 7 retention >30% for activated users (those who ran at least 1 ATS analysis).

### 5. Engagement by Plan

Compare event counts: free vs starter vs pro vs elite users.

---

## Revenue Metrics (Manual / Custom)

Track monthly in a spreadsheet or connect to your Razorpay dashboard:

| Metric | Formula |
|---|---|
| MRR | Sum of all active subscription amounts |
| New MRR | Sum of new subscriptions this month |
| Churned MRR | Sum of cancelled subscriptions |
| Net MRR Growth | New MRR - Churned MRR |
| ARPU | MRR / Active paying users |
| LTV | ARPU × Average tenure months |

Target MRR milestones:
- Month 1: ₹10,000 (30 paying users)
- Month 3: ₹50,000 (150 paying users)
- Month 6: ₹2,00,000 (500 paying users)
