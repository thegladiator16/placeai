# PlaceAI — Vercel Deployment Instructions

Your code is committed and ready. Follow these steps to get a live URL.

---

## Step 1: Rename branch to `main`

Git initialized with branch `master`. Rename it first:

```bash
cd C:\Users\ironm\OneDrive\Desktop\submission\placeai
git branch -M main
```

---

## Step 2: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `placeai`
3. Description: `AI Placement Copilot for Indian Engineers`
4. Visibility: **Public** (required for free Vercel hobby tier)
5. ⚠️ Do **NOT** check "Add README" or "Add .gitignore" — your repo already has them
6. Click **"Create repository"**

---

## Step 3: Push Your Code to GitHub

After creating the repo, GitHub shows you commands. Use these (replace `yourusername`):

```bash
cd C:\Users\ironm\OneDrive\Desktop\submission\placeai

git remote add origin https://github.com/yourusername/placeai.git
git push -u origin main
```

**If it asks for a password**, use a Personal Access Token (not your GitHub password):
1. Go to **https://github.com/settings/tokens/new**
2. Note: `placeai deploy`
3. Expiration: 90 days
4. Scopes: check **`repo`**
5. Click "Generate token" → copy the token
6. Use it as your password when git prompts

---

## Step 4: Deploy to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Find and select your `placeai` repo
4. Vercel auto-detects Next.js — configure the project:
   - **Framework Preset**: Next.js ✅ (auto-detected)
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm turbo build --filter=web` *(or leave default)*
   - **Output Directory**: `.next` *(leave default)*
   - **Install Command**: `pnpm install --frozen-lockfile`

5. Expand **"Environment Variables"** and add these:

| Name | Value | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_xxx` | [clerk.com](https://clerk.com) → Your App → API Keys |
| `CLERK_SECRET_KEY` | `sk_test_xxx` | Same Clerk page |
| `CLERK_WEBHOOK_SECRET` | `whsec_xxx` | Clerk → Webhooks (add after deploy) |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` | [console.anthropic.com](https://console.anthropic.com) |
| `DATABASE_URL` | `postgresql://...` | [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) — free tier |
| `DIRECT_URL` | same as DATABASE_URL | Same |
| `RAZORPAY_KEY_ID` | `rzp_test_xxx` | Add later after Razorpay KYC |
| `RAZORPAY_KEY_SECRET` | `xxx` | Add later |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_xxx` | Add later |
| `NEXT_PUBLIC_APP_URL` | `https://placeai-xxx.vercel.app` | Your Vercel URL (set after first deploy) |

> 💡 **Minimum for first deploy**: You need at least `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ANTHROPIC_API_KEY`, and `DATABASE_URL` to get a working app.

6. Click **"Deploy"**
7. Wait **3–5 minutes** for the build to complete
8. 🎉 Copy your live URL — it will look like: `https://placeai-abc123.vercel.app`

---

## Step 5: Post-Deploy Configuration

### Set up Clerk webhook
1. Copy your Vercel URL (e.g. `https://placeai-abc123.vercel.app`)
2. Go to Clerk Dashboard → **Webhooks** → Add endpoint
3. URL: `https://placeai-abc123.vercel.app/api/v1/auth/sync`
4. Subscribe to: `user.created`, `user.updated`
5. Copy the signing secret → add to Vercel env as `CLERK_WEBHOOK_SECRET`
6. Vercel will auto-redeploy

### Set up Database (Neon — free, recommended)
1. Go to **https://neon.tech** → Create project (name: `placeai`, region: `ap-south-1` Mumbai)
2. Copy the connection string
3. Add to Vercel env as `DATABASE_URL` and `DIRECT_URL`
4. Run migrations once: open Neon's SQL editor and run your schema, OR set up a one-time migration trigger

### Update NEXT_PUBLIC_APP_URL
1. In Vercel → Settings → Environment Variables
2. Set `NEXT_PUBLIC_APP_URL` = your actual Vercel URL
3. Trigger redeploy: Vercel → Deployments → Redeploy

---

## Step 6: Add Vercel URL to Razorpay

Once you have your live URL:

1. Go to **https://dashboard.razorpay.com** → Settings → Website & App
2. Add your Vercel URL as the website
3. Complete KYC (takes 1–2 business days)
4. After approval, go to Settings → API Keys → Generate
5. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` to Vercel env vars
6. Vercel auto-redeploys

---

## Quick Reference: All Commands

```bash
# From C:\Users\ironm\OneDrive\Desktop\submission\placeai

# Rename branch
git branch -M main

# Connect to GitHub (replace yourusername)
git remote add origin https://github.com/yourusername/placeai.git
git push -u origin main

# After making changes, deploy with:
git add .
git commit -m "fix: your change description"
git push   # Vercel auto-deploys on every push to main
```

---

## Troubleshooting

**Build fails with "Cannot find module @placeai/db"**
- Make sure Root Directory is set to `apps/web` in Vercel project settings

**"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"**
- Check env vars in Vercel → Settings → Environment Variables
- Trigger a new deployment after adding them

**Database connection fails**
- Ensure `DATABASE_URL` is set and the database is accessible from Vercel's servers
- Neon and Supabase both work out of the box (no VPC restrictions on free tier)

**Clerk auth redirect loop**
- Set `NEXT_PUBLIC_APP_URL` to your exact Vercel URL
- In Clerk → Domains, add your Vercel domain

---

*Your code is committed and ready at: `C:\Users\ironm\OneDrive\Desktop\submission\placeai`*
*Commit: `e1e26a4 feat: placeai full product - ready for vercel deployment`*
