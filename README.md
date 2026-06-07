# PlaceAI — India's First AI Placement Copilot

> End-to-end AI placement copilot: Resume → ATS → Referral → Outreach → Interview → Offer

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js 14 (App Router) + TypeScript               │
│  Clerk Auth │ Tailwind + shadcn/ui │ Framer Motion  │
└────────────────────────┬────────────────────────────┘
                         │ API Routes
┌────────────────────────▼────────────────────────────┐
│  @placeai/db (Drizzle ORM + PostgreSQL)             │
│  BullMQ + Redis │ Cloudflare R2 │ Razorpay/Stripe   │
└────────────────────────┬────────────────────────────┘
                         │ Internal HTTP
┌────────────────────────▼────────────────────────────┐
│  Python FastAPI AI Service                          │
│  Anthropic Claude │ pdfplumber │ spaCy │ Pinecone   │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker (for local Postgres + Redis)

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd placeai
pnpm install
```

### 2. Set environment variables

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your values
```

Required for local dev:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from clerk.com
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `AI_SERVICE_SECRET` — any random string for local

### 3. Start infrastructure

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
```

### 4. Run database migrations

```bash
pnpm --filter @placeai/db db:migrate
pnpm --filter @placeai/db db:seed
```

### 5. Start AI service

```bash
cd apps/ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 6. Start Next.js

```bash
pnpm dev
```

App runs at http://localhost:3000

## Running Tests

```bash
# All tests
pnpm test

# Frontend unit tests
pnpm --filter @placeai/web test

# AI service tests
cd apps/ai-service && pytest tests/ -v

# E2E (requires app running)
pnpm --filter @placeai/web test:e2e
```

## Project Structure

```
placeai/
├── apps/
│   ├── web/              # Next.js 14 frontend + API routes
│   └── ai-service/       # Python FastAPI AI service
├── packages/
│   ├── db/               # Drizzle ORM schema + migrations
│   ├── types/            # Shared TypeScript types + Zod schemas
│   └── config/           # ESLint + TypeScript configs
└── infrastructure/
    ├── docker/           # Docker + docker-compose
    └── terraform/        # AWS IaC (Phase 2+)
```

## Environment Variables Reference

See [.env.local.example](.env.local.example) for all required variables with descriptions.

For a full step-by-step setup guide, see [SETUP.md](SETUP.md).

## Deployment

### Next.js → Vercel
```bash
vercel deploy --prod
```

### AI Service → AWS ECS
```bash
docker build -f infrastructure/docker/Dockerfile.ai -t placeai-ai .
# Push to ECR and update ECS service
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack Query |
| Auth | Clerk |
| Database | PostgreSQL (Drizzle ORM), Redis |
| AI | Anthropic Claude (Haiku/Sonnet) |
| Payments | Razorpay (INR), Stripe (International) |
| Storage | Cloudflare R2 |
| AI Service | Python FastAPI, pdfplumber, spaCy |
| Testing | Vitest, Playwright, pytest |
| CI/CD | GitHub Actions |
