# PlaceAI Pre-Launch Deployment Checklist

## Code Quality

- [ ] `pnpm typecheck` — 0 TypeScript errors
- [ ] `pnpm lint` — 0 ESLint errors
- [ ] `pnpm test` — all 42+ tests pass
- [ ] `pnpm build` — Next.js build succeeds
- [ ] No `console.log` in production code (only `console.warn`/`console.error`)
- [ ] No commented-out code blocks committed
- [ ] No hardcoded secrets or API keys in source

## Functionality

- [ ] Signup / login flow works end-to-end (email + Google)
- [ ] Onboarding wizard saves all 5 steps
- [ ] Resume upload works for PDF and DOCX
- [ ] ATS analysis generates a real score (0–100)
- [ ] Job board shows 50+ jobs with filters
- [ ] Application tracker drag-and-drop works
- [ ] Interview prep generates questions and feedback
- [ ] Referral alumni search returns results
- [ ] Referral message modal generates 3 messages
- [ ] Cover letter generator streams output
- [ ] Recruiter outreach builder generates 3-step sequence
- [ ] All forms validate and show inline errors
- [ ] All error states handled gracefully (no blank screens)
- [ ] 404 page is branded (test: navigate to /nonexistent)
- [ ] `GET /api/health` returns `{ status: "ok" }`

## Payments

- [ ] Razorpay test checkout opens
- [ ] Test payment succeeds with card `4111 1111 1111 1111`
- [ ] Webhook receives payment confirmation
- [ ] User plan upgrades in database after payment
- [ ] Feature limits increase after upgrade

## Security

- [ ] `.env` files are in `.gitignore` (verify: `git check-ignore .env.local`)
- [ ] No secrets in git history (`git log --all -p | grep -i "sk-ant\|rzp_live\|sk_live"`)
- [ ] All user inputs validated with Zod schemas
- [ ] CORS configured for production domain only
- [ ] Rate limiting active on AI endpoints
- [ ] Clerk webhook signature verified
- [ ] CSP headers set in `next.config.ts`
- [ ] `X-Frame-Options: DENY` header set
- [ ] All API routes require authentication (except public endpoints)

## Performance

- [ ] Lighthouse score > 90 on `/` (public landing page)
- [ ] API responses < 1 second (except AI generation which streams)
- [ ] Database queries < 100ms (check with Drizzle Studio)
- [ ] Images use `next/image` (optimized)
- [ ] Fonts use `next/font` (no FOUT)
- [ ] Bundle size < 150MB output-standalone
- [ ] No unused npm packages

## Infrastructure

- [ ] Database backups configured (daily, 7-day retention)
- [ ] Sentry error tracking connected (test: trigger an error)
- [ ] PostHog analytics connected (test: verify events in dashboard)
- [ ] All Vercel environment variables set
- [ ] Vercel deployment completes in < 3 minutes
- [ ] Custom domain configured (placeai.in → Vercel)
- [ ] SSL certificate active (HTTPS working)
- [ ] Clerk webhook URL updated to production domain

## Documentation

- [ ] `README.md` has project overview and quick start
- [ ] `SETUP.md` has complete local setup guide
- [ ] `ANALYTICS.md` has events documentation
- [ ] `DEPLOYMENT_CHECKLIST.md` this file — reviewed and signed off

---

## Sign-Off

| Check | By | Date |
|---|---|---|
| All tests pass | | |
| Build clean | | |
| Payment flow tested | | |
| Security review done | | |
| Deployed to production | | |
