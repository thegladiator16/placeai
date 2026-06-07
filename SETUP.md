# PlaceAI Setup Guide

## Prerequisites

- Node.js 20 LTS
- pnpm (`npm install -g pnpm`)
- Docker and Docker Compose
- Git

## Quick Start (5 minutes)

### 1. Install dependencies

```bash
git clone https://github.com/yourusername/placeai.git
cd placeai
pnpm install
```

### 2. Configure environment

```bash
cp .env.local.example apps/web/.env.local
# Open apps/web/.env.local and fill in your credentials
```

### 3. Start services and app

```bash
docker-compose up -d      # starts postgres + redis
sleep 5                   # wait for postgres to initialize
pnpm --filter @placeai/db db:migrate   # apply schema migrations
bash scripts/db-setup.sh  # seed all data
pnpm dev                  # starts Next.js on http://localhost:3000
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000)

---

## External Services Setup (Required for Full Features)

### 1. Clerk — Authentication

1. Go to [https://clerk.com](https://clerk.com) → Create application
2. Enable: Email/Password, Google OAuth, GitHub
3. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. In Clerk → Webhooks → Add endpoint: `https://yourdomain.com/api/v1/auth/sync`
5. Subscribe to events: `user.created`, `user.updated`
6. Copy webhook secret to `CLERK_WEBHOOK_SECRET`

### 2. Anthropic — AI Features

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy to `ANTHROPIC_API_KEY`

### 3. Razorpay — Payments (India)

1. Sign up at [https://razorpay.com](https://razorpay.com) and complete KYC
2. In test mode, go to Settings → API Keys → Generate Key
3. Copy `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. Create subscription plans:
   - Starter: ₹299/month
   - Pro: ₹699/month
   - Elite: ₹999/month
5. For webhooks (production): Settings → Webhooks → `https://placeai.in/api/v1/billing/webhook/razorpay`

**Test cards:**
- Card number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

### 4. Cloudflare R2 — File Storage

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) → R2
2. Create bucket: `placeai-resumes`
3. Settings → CORS: Allow `GET`, `PUT` from your domain
4. Account → R2 API Tokens → Create token with `Object Read & Write`
5. Copy credentials to env file

### 5. Pinecone — Vector Search (optional)

1. Go to [https://pinecone.io](https://pinecone.io)
2. Create index: `placeai-jobs` / 1536 dimensions / cosine similarity / AWS us-east-1
3. Copy API key to `PINECONE_API_KEY`

### 6. Upstash Redis — Caching (production)

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Create Redis database (region: Mumbai for India latency)
3. Copy REST URL and token to env file

### 7. Resend — Transactional Email

1. Go to [https://resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create API key → copy to `RESEND_API_KEY`

---

## Database Commands

```bash
pnpm --filter @placeai/db db:migrate      # apply schema migrations
pnpm --filter @placeai/db db:seed         # seed users, companies, jobs
pnpm --filter @placeai/db db:seed-alumni  # seed 500 alumni entries
pnpm --filter @placeai/db db:seed-jobs    # seed 50 job listings
pnpm --filter @placeai/db db:verify       # verify seed data counts
pnpm --filter @placeai/db db:studio       # open Drizzle Studio (GUI)
bash scripts/db-reset.sh                  # ⚠️  delete all data and re-seed
```

## Development Commands

```bash
pnpm dev          # start all apps in dev mode
pnpm build        # production build
pnpm typecheck    # TypeScript check (0 errors required)
pnpm lint         # ESLint check
pnpm test         # run all unit tests (42 tests)
```

---

## Testing Core User Flows Locally

### Flow 1: Signup → Resume → ATS Analysis

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Try Free" → sign up with any email
3. Complete onboarding wizard (5 steps)
4. Go to `/resume` → Upload a PDF resume
5. Go to `/resume/[id]/ats` → Paste a job description → Analyze
6. Verify score ring animates and keywords appear

### Flow 2: Payment & Upgrade

1. Dashboard → click "Upgrade"
2. Select "Pro" plan
3. Click "Pay Now" → Razorpay test checkout opens
4. Pay with test card: `4111 1111 1111 1111`
5. Verify tier changes to "pro" in dashboard

### Flow 3: Job Board

1. Go to `/jobs`
2. Search "Software Engineer" → verify results appear
3. Click "Save Job" → go to `/tracker` → verify it appears
4. Drag job card to "Applied" column

### Flow 4: Referral Discovery

1. Go to `/referrals`
2. Search "Zepto" → alumni cards appear
3. Click "Generate Referral Message" → modal opens
4. Click "Generate Messages" → 3 message templates appear
5. Click "Mark as Sent" → appears in My Referral Contacts

### Flow 5: Interview Prep

1. Go to `/interviews`
2. Select "Behavioral" + Company: "CRED" + Role: "Backend Engineer"
3. Click "Start Interview" → 7 questions generated
4. Answer all questions → Submit
5. Session summary appears with radar chart

---

## Troubleshooting

**"Cannot connect to database"**
```bash
docker ps | grep postgres              # verify it's running
docker-compose down && docker-compose up -d  # restart
```

**"Clerk authentication not working"**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Clear browser cookies
- Check Clerk dashboard → Users tab

**"TypeScript errors after editing"**
```bash
pnpm typecheck    # see all errors
# Fix imports — @placeai/db types require ?? null, never undefined
```

**"AI generation returns empty"**
- Verify `ANTHROPIC_API_KEY` is valid
- Check you haven't exceeded API rate limits

---

## Deployment

### Vercel (Next.js frontend)

```bash
bash scripts/deploy-vercel.sh
```

Or manually:
1. Push to GitHub
2. Connect repo to Vercel at [https://vercel.com](https://vercel.com)
3. Set all environment variables in Vercel dashboard
4. Set Root Directory: `apps/web`
5. Deploy

### Database (Supabase / Neon)

For production, use Supabase or Neon instead of local Postgres:
1. Create project at [https://supabase.com](https://supabase.com) (Mumbai region)
2. Copy connection string to `DATABASE_URL`
3. Run `pnpm --filter @placeai/db db:migrate`
