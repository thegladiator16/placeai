#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying PlaceAI to Vercel..."

# Ensure git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working directory is not clean. Commit or stash changes first."
  git status --short
  exit 1
fi

# Run type check
echo "🔍 Running type check..."
pnpm typecheck

# Run tests
echo "🧪 Running tests..."
pnpm test

# Build locally to catch errors early
echo "🔨 Building locally..."
pnpm build

# Push to GitHub (Vercel auto-deploys on push)
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed to GitHub. Vercel will auto-deploy."
echo "   Monitor at: https://vercel.com/dashboard"
