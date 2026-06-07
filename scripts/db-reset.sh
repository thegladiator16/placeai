#!/usr/bin/env bash
set -euo pipefail

echo "⚠️  WARNING: This will DELETE ALL DATA in the database."
read -r -p "Are you sure? (type 'yes' to confirm): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "🗑️  Resetting PlaceAI database (dev only)..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set."
  exit 1
fi

# Drop and recreate schema
psql "$DATABASE_URL" -c "
  DROP SCHEMA IF EXISTS public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO PUBLIC;
"

# Re-run migrations and seeds
bash "$(dirname "$0")/db-setup.sh"

echo "✅ Database reset complete!"
