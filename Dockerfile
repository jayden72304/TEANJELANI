# Multi-stage build for self-hosting on any Docker host (a free-tier VM, a
# spare machine, a VPS). Uses node:22-slim (glibc, not alpine) so
# better-sqlite3's prebuilt native binary resolves cleanly on both x86_64
# and arm64 hosts (e.g. Oracle Cloud's free Ampere A1 instances).

FROM node:22-slim AS deps
WORKDIR /app
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 1001 --create-home nextjs
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /data && chown -R nextjs:nextjs /data /app
USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD curl -fsS http://localhost:3000/login || exit 1

# Applies pending migrations and (re-)seeds the admin login (idempotent —
# safe on every restart) before starting the server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && npm start"]
