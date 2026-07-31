#!/bin/sh
# Container entrypoint for the API.
#
# Order matters: the database schema must be current before the app accepts
# traffic, and any provisioning must happen before the first request. The dev
# seed (destructive) is NEVER run here — only the idempotent bootstrap.
set -e

SCHEMA="apps/api/prisma/schema.prisma"

echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
./node_modules/.bin/prisma migrate deploy --schema="$SCHEMA"

# Idempotent, non-destructive provisioning. Opt-in via RUN_BOOTSTRAP=true; it
# requires ADMIN_EMAIL/ADMIN_PASSWORD and fails loudly (aborting start) if they
# are missing, so a misconfigured deploy does not silently run unprovisioned.
if [ "${RUN_BOOTSTRAP:-false}" = "true" ]; then
  echo "[entrypoint] Running production bootstrap..."
  node bootstrap.js
else
  echo "[entrypoint] RUN_BOOTSTRAP not set to true; skipping bootstrap."
fi

echo "[entrypoint] Starting API..."
exec node main.js
