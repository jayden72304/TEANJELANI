# Agent Client Hub

A self-hosted CRM built for an NBA agent to manage clients, contracts, marketing
leads, and media/brand monitoring in one place.

## What's here

1. **Client profiles** — name, team/league/position, birthday, home address,
   phone numbers, emails, parents/guardian/spouse contacts, clothing sizes, and
   social media handles.
2. **Contracts** — league and marketing contracts per client (counterparty,
   value, dates, terms, status).
3. **Leads & brand analytics** — a lead pipeline for companies interested in a
   client, plus a live-scanned feed of brands newly entering sports or
   partnering with comparable athletes, with keyword flagging.
4. **Media monitoring** — a live-scanned feed of everything published online
   about each client.
5. **Per-client dashboard** — a tabbed view (Profile / Contracts / Marketing &
   Leads / Media Monitoring) for every client.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Prisma 7** + SQLite (via `@prisma/adapter-better-sqlite3`) — swap to
  Postgres/MySQL by changing the `datasource` provider in
  `prisma/schema.prisma` and pointing `DATABASE_URL` at it
- **Tailwind CSS 4**
- Custom cookie-session auth (`jose` + `bcryptjs`), following the
  [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) —
  no third-party auth vendor required

## Getting started

```bash
npm install                 # also runs `prisma generate` via postinstall
cp .env.example .env         # then set a real SESSION_SECRET (openssl rand -base64 32)
npm run db:migrate           # create the SQLite database
npm run db:seed              # create an admin login + a demo client
npm run dev
```

Open http://localhost:3000 and log in with the seeded admin account:

- Email: `agent@example.com`
- Password: `ChangeMe123!`

**Change this password (or the account) immediately** — either edit
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars before seeding, or add a
new `User` row with a fresh `bcrypt` hash once you're in.

The seeded "Malik Bridges" client is placeholder demo data — delete it from
the Clients page once you're ready to add real clients.

## Media monitoring & brand analytics — how it actually works

Every client's full name is automatically searched against **Google News RSS**
(`news.google.com/rss/search`) — a free, public, no-API-key source — on every
scan. You can add extra keywords per client (nicknames, brand names) from the
client's Media Monitoring tab, and global brand/industry keywords from the
Brand Analytics tab. Click **"Run scan now"** anywhere in the app to trigger a
scan on demand, or schedule it:

```bash
npm run ingest        # runs scripts/ingest.ts once — wire this to cron
```

For a real deployment, put `npm run ingest` on a schedule (cron, a Vercel Cron
Job, GitHub Actions, etc.) so mentions and brand signals accumulate without
someone clicking the button.

### Adding real-time social sources (X/Twitter, Instagram, etc.)

Google News RSS covers news/web mentions well, but **not** live social posts —
those platforms require paid, credentialed APIs. The data model and UI are
already built to support them:

- `src/lib/connectors/types.ts` defines the `MentionConnector` interface every
  source implements (`search(query) -> RawMention[]`).
- `src/lib/connectors/google-news.ts` is the reference implementation — copy
  its shape for a new source.
- `src/lib/connectors/registry.ts` lists `activeConnectors` (what actually
  runs) and `plannedConnectors` (documented, not yet wired up — shown to the
  agent as a status list). Add your new connector to `activeConnectors` once
  it's implemented and its API key is in `.env`.
- `src/lib/ingest.ts` orchestrates all active connectors against every
  client's tracked keywords — it doesn't need to change when you add a
  connector.

Planned/stubbed sources and what they need:

| Source | Needs |
| --- | --- |
| X (Twitter) API v2 | Paid API plan + bearer token |
| Instagram Graph API | Meta developer app + Business account + app review |
| Brandwatch / Meltwater | Enterprise social-listening subscription |

## Project structure

```
prisma/schema.prisma          Data model for all 4 components
src/lib/session.ts, dal.ts    Cookie-session auth (jose) + session verification
src/proxy.ts                  Route-level auth redirect (Next 16's proxy, formerly middleware)
src/app/actions/*             Server Actions (create/update/delete for every entity)
src/lib/data/*                Read queries (Prisma, React `cache`-wrapped)
src/lib/connectors/*          Pluggable mention/news sources
src/lib/ingest.ts             Scan orchestration (client mentions + brand signals)
scripts/ingest.ts             CLI entry point for cron-based scanning
prisma/seed.ts                Admin user + demo client seeding
src/app/(app)/*                Authenticated app (dashboard, clients, contracts, leads, monitoring, analytics)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / start |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the admin user + demo client |
| `npm run db:studio` | Open Prisma Studio to browse the database |
| `npm run ingest` | Run one media/brand monitoring scan (cron this) |
| `npm run lint` | Lint |

## Deploying

This app needs a persistent filesystem for the SQLite file (or switch to a
hosted Postgres — recommended for anything beyond single-instance use) and a
process/host that can run `npm run ingest` on a schedule. A small VPS,
Railway, Render, or a Vercel deployment + hosted Postgres + Vercel Cron Job
all work well.
