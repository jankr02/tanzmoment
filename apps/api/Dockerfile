# syntax=docker/dockerfile:1

# =============================================================================
# Builder: install all deps, generate the Prisma client, build the API bundle,
# and compile the standalone bootstrap script.
#
# Debian (bookworm-slim), not Alpine: sharp and the Prisma query engine ship
# glibc prebuilt binaries; musl would force slow/failed native rebuilds.
# =============================================================================
FROM node:20-bookworm-slim AS builder

ENV NX_DAEMON=false
WORKDIR /app

# openssl: required by Prisma. build-essential/python3: fallback for any native
# module without a prebuilt binary for this platform.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# --legacy-peer-deps mirrors the repo's .npmrc: the workspace pins vitest 4 while
# some Angular build peers still request vitest 3, which strict resolution rejects.
RUN npm ci --legacy-peer-deps

COPY . .

# Generate the Prisma client (schema lives outside the default location).
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API. generatePackageJson emits dist/apps/api/{package.json,
# package-lock.json} listing only the runtime dependencies.
RUN npx nx build api

# Compile the bootstrap script to plain CommonJS so the runtime image can run
# it with node alone (tsx is a dev-only dependency and is absent at runtime).
RUN npx tsc apps/api/prisma/bootstrap.ts \
  --outDir /app/bootstrap-dist \
  --rootDir apps/api/prisma \
  --module commonjs \
  --target es2021 \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

# =============================================================================
# Runtime: slim image with only the built bundle, production dependencies, the
# Prisma CLI (for `migrate deploy`), and the generated client.
# =============================================================================
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Built bundle plus the generated runtime package.json / lockfile.
COPY --from=builder /app/dist/apps/api ./

# Install only the runtime dependencies. The nx-generated package.json pins exact
# versions, but its pruned lockfile is not always npm-ci-perfect, so use
# npm install (which reconciles the lock) rather than npm ci.
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Two dependencies are missing from the generated manifest and are installed in a
# SINGLE command — a later `npm install --no-save` prunes anything not saved,
# which would drop a separately-installed package:
#   - prisma: the CLI is a dev dependency upstream but is needed by the entrypoint
#     for `migrate deploy`. Pin it to the already-installed @prisma/client version
#     so the CLI/engine never drift from the generated client.
#   - happy-dom: a peer dependency of @tiptap/html (news bodyHtml is rendered
#     server-side via @tiptap/html/server); nx's generatePackageJson omits peers.
RUN npm install \
      "prisma@$(node -p "require('@prisma/client/package.json').version")" \
      happy-dom@20.9.0 \
      --no-save --legacy-peer-deps --no-audit --no-fund

# Prisma schema + migrations, then regenerate the client against the freshly
# installed node_modules (npm ci above replaced the builder's generated client).
COPY apps/api/prisma ./apps/api/prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Standalone bootstrap and the entrypoint.
COPY --from=builder /app/bootstrap-dist/bootstrap.js ./bootstrap.js
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Uploads live on the local disk at cwd()/apps/api/uploads. Create the directory
# owned by the unprivileged `node` user so the mounted named volume inherits
# writable ownership on first creation.
RUN mkdir -p /app/apps/api/uploads && chown -R node:node /app/apps/api/uploads

USER node

EXPOSE 3000

# Probe the app's own /health so an unhealthy DB/Redis marks the container
# unhealthy. Uses node (no curl/wget in the slim image). start-period covers
# migrate deploy + boot.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
