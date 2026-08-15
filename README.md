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

## Keeping it always available

Two ways to do this, depending on whether you'd rather pay a small monthly
fee for zero setup, or spend a bit more time up front to run it for free.

### Option A — Render (~$7/mo, ~5 minutes of setup)

The included `render.yaml` Blueprint provisions two services on
[Render](https://render.com): the web app on a 1GB persistent disk (SQLite
lives at `/data`, migrations + admin seeding run automatically on every
deploy), and a cron job that calls `POST /api/ingest` every 30 minutes so
mentions and brand signals keep updating on their own.

1. Push this repo to your own GitHub account.
2. Render dashboard → **New → Blueprint** → connect that repo/branch. It
   reads `render.yaml` and provisions both services.
3. When prompted, set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to a real
   login (don't leave the `agent@example.com` / `ChangeMe123!` default on a
   public deployment). `SESSION_SECRET` and `INGEST_SECRET` are generated
   for you.
4. Deploy → you get a permanent `https://agent-client-hub.onrender.com`
   -style URL (custom domains supported).

### Option B — Docker on a free VM (e.g. Oracle Cloud Always Free), $0/mo

The `Dockerfile` and `docker-compose.yml` in this repo run the app anywhere
Docker runs — a spare machine, a cheap VPS, or a **genuinely free forever**
VM from [Oracle Cloud's Always Free tier](https://www.oracle.com/cloud/free/)
(up to 4 ARM cores / 24GB RAM, no time limit). Two honest caveats before you
go this route: Oracle requires a credit card for identity verification even
though the Always Free tier itself never charges you, and free-tier ARM
capacity is sometimes unavailable in busy regions — if you hit "out of host
capacity," try a different Availability Domain or region.

**1. Get a VM.** Oracle Cloud console → Compute → Create Instance → shape
`VM.Standard.A1.Flex` (Always Free eligible) → Ubuntu 24.04 image. In the
instance's **Security List / Network Security Group**, add an ingress rule
for port 3000 (and later 80 + 443 once you add HTTPS). Ubuntu images also
run their own firewall — once you're SSH'd in:
```bash
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save   # if installed; otherwise repeat after reboot
```

**2. Install Docker** (any Ubuntu/Debian VM, any provider):
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
```

**3. Get the app and configure it:**
```bash
git clone https://github.com/jayden72304/TEANJELANI.git
cd TEANJELANI
cp .env.example .env
```
Edit `.env`: set real `SESSION_SECRET` / `INGEST_SECRET` (`openssl rand
-base64 32` for each) and `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

**4. Run it:**
```bash
docker compose up -d --build
```
Visit `http://<your-VM's-public-IP>:3000` and log in.

**5. (Recommended before giving your boss the link) Add HTTPS.** Point a
domain's A record at the VM's public IP, set `DOMAIN=your-domain.com` in
`.env`, then:
```bash
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d --build
```
This adds [Caddy](https://caddyserver.com) in front of the app, which
automatically gets and renews a real Let's Encrypt certificate — no manual
nginx/certbot config. Without this step the app is reachable but over plain
HTTP, which means login credentials and client data travel unencrypted —
fine for you to test with, not something to hand your boss a link to.

**Updating later:** `git pull && docker compose up -d --build`.

### Alternatives

- **Any other VPS** (a $4–6/mo DigitalOcean/Linode/Hetzner box, if Oracle's
  free tier doesn't work out for your account/region) — identical Docker
  steps above; the whole point of containerizing it is host-portability.
- **Railway** — same idea as Render (persistent volume + a service hitting
  `/api/ingest` on a schedule), configured by hand in its dashboard.
- **Outgrowing SQLite / want serverless (Vercel, etc.):** switch
  `datasource.provider` in `prisma/schema.prisma` from `sqlite` to
  `postgresql`, point `DATABASE_URL` at a hosted Postgres (Neon, Supabase,
  Render Postgres), run `npx prisma migrate deploy`, and use the platform's
  own cron feature (e.g. Vercel Cron Jobs) to hit `/api/ingest` on a
  schedule instead of a separate always-on cron service.
