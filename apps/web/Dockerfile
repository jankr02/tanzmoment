# syntax=docker/dockerfile:1

# =============================================================================
# Builder: build the Angular browser bundle.
#
# The production config uses outputMode:server (SSR), but for the single-origin
# soft-launch we serve the static browser bundle (dist/apps/web/browser) as an
# SPA via Caddy. This sidesteps the SSR server's inability to proxy the relative
# /api and /uploads calls (its proxy is not wired up), while still producing the
# exact same client bundle.
# =============================================================================
FROM node:20-bookworm-slim AS builder

ENV NX_DAEMON=false
WORKDIR /app

COPY package.json package-lock.json ./
# --legacy-peer-deps mirrors the repo's .npmrc (vitest 3/4 peer mismatch).
RUN npm ci --legacy-peer-deps

COPY . .

RUN npx nx build web --configuration=production

# =============================================================================
# Runtime: Caddy serving the browser bundle and reverse-proxying the API.
# =============================================================================
FROM caddy:2-alpine AS runtime

COPY --from=builder /app/dist/apps/web/browser /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
