#!/usr/bin/env bash
set -euo pipefail

echo "🗄️  Setting up PlaceAI database..."

# Ensure DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in values."
  exit 1
fi

# Apply Drizzle migrations
echo "📦 Running Drizzle migrations..."
pnpm --filter @placeai/db db:migrate

# Seed initial data
echo "🌱 Seeding database with initial data..."
pnpm --filter @placeai/db db:seed

# Seed alumni index
echo "🎓 Seeding alumni index (500 entries)..."
pnpm --filter @placeai/db db:seed-alumni

# Seed job board (50 jobs)
echo "💼 Seeding job board..."
pnpm --filter @placeai/db db:seed-jobs

# Verify
echo "✅ Verifying seed data..."
pnpm --filter @placeai/db db:verify

echo ""
echo "✅ Database setup complete!"
