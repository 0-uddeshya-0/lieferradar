# LieferRadar

[![CI](https://github.com/0-uddeshya-0/lieferradar/actions/workflows/ci.yml/badge.svg)](https://github.com/0-uddeshya-0/lieferradar/actions/workflows/ci.yml)

**Weniger Lieferanten hinterhertelefonieren. Weniger verspätete Lieferungen.**

LieferRadar is a supplier delay intelligence tool for German manufacturing SMEs. Purchasing managers register open supplier orders, send magic-link status pages to suppliers (no login required), automate follow-up reminders, and monitor delay risk on a live dashboard with supplier reliability scorecards.

**Live demo:** https://0-uddeshya-0.github.io/lieferradar/

## What works on GitHub Pages vs full deploy

| Feature | GitHub Pages (demo) | Full deploy (local / server) |
|---------|---------------------|------------------------------|
| Landing page & product overview | Yes | Yes |
| German / English language toggle | Yes | Yes |
| Dashboard with orders & filters | Sample data (in-memory) | Live data |
| Supplier scorecard | Sample data (in-memory) | Live data |
| Supplier magic-link page | Demo token (`/s/demo`) | Real magic links |
| CSV import, create orders & suppliers | Works for the session (in-memory) | Persisted in PostgreSQL |
| Login / registration | Skipped in demo | JWT with refresh tokens |
| Email notifications | — | SMTP (Mailgun, Postmark, etc.) |
| Cron reminders & weekly digest | — | node-cron jobs |
| API backend | — | Fastify on Node 20 |

GitHub Pages serves the static frontend only. For the full product (database, emails, cron jobs), run locally or deploy the API + PostgreSQL to a server — see [docs/deployment.md](docs/deployment.md).

## Features

- **Order management** — Create orders manually or import up to 500 rows via CSV (with order values)
- **Supplier magic links** — Mobile-friendly status page (`/s/:token`); suppliers confirm status and delivery dates without a login
- **AB-Abgleich** — Confirmed delivery dates are diffed against requested dates; late confirmations flag the order critical
- **Automated chasing** — Hourly cron sends reminders after 2 and 5 days of silence
- **Dashboard** — Filterable order table with risk indicators, value at risk in €, and 6-month trend charts
- **Supplier scorecard** — On-time rate, response time, and responsiveness labels per supplier
- **Team accounts** — Invite colleagues into the organization via email
- **ROI metrics** — Dashboard shows automated supplier requests in the last 30 days
- **Weekly digest** — Monday 08:00 email summary to managers
- **Bilingual UI** — German/English toggle, persisted per browser
- **JWT auth** — HttpOnly cookie sessions with refresh token rotation
- **API keys & webhooks** — Bearer-token API access plus HMAC-signed webhooks for n8n, Make, Zapier, or custom automation ([docs](docs/integrations.md))
- **MCP server** — AI agents (e.g. Claude) can query orders, scorecards, and send reminders via `packages/mcp`
- **DSGVO-ready** — Organization deletion endpoint and AVV template included

## Roadmap

Sequenced by what pilot customers need next — see [docs/strategy.md](docs/strategy.md) for the reasoning.

1. Inbound email parsing — supplier replies update order status automatically
2. Native ERP connectors (SAP Business One Service Layer, proAlpha, abas) — the CSV-watch agent covers every ERP today
3. Per-customer sending domains for deliverability
4. Opt-in, anonymized supplier reliability benchmarks across organizations

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  React Web App  │────▶│  Fastify API    │────▶│   PostgreSQL     │
│  (Vite, :5173)  │     │  (Node, :3001)  │     │   (Prisma ORM)   │
└─────────────────┘     └────────┬────────┘     └──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────────┐
              │  SMTP   │  │  Cron   │  │  Supplier   │
              │ (email) │  │  jobs   │  │  magic link │
              └─────────┘  └─────────┘  └─────────────┘
```

Monorepo layout (pnpm workspaces):

```
lieferradar/
├── apps/api/          # Fastify backend
├── apps/web/          # React frontend
├── packages/shared/   # Zod schemas & shared types
├── packages/mcp/      # MCP server for AI agents
├── packages/csv-watch/# Folder-watching ERP connector
├── prisma/            # Schema, migrations, seed
├── scripts/           # Test data generator
└── docs/              # Architecture, API, deployment
```

See [docs/architecture.md](docs/architecture.md) for details.

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- **Docker** — for local PostgreSQL and MailHog

## Setup

```bash
git clone https://github.com/0-uddeshya-0/lieferradar.git
cd lieferradar
pnpm install

cp .env.example .env
cp apps/web/.env.example apps/web/.env

docker compose up -d

pnpm db:generate
pnpm db:migrate
pnpm db:seed

pnpm dev
```

- **Web:** http://localhost:5173
- **API:** http://localhost:3001
- **MailHog UI:** http://localhost:8025

### Seed credentials

| Field    | Value              |
|----------|--------------------|
| Email    | `manager@muster.de` |
| Password | `Test1234!`         |

## Usage

1. **Register** or log in with seed credentials
2. **Import orders** via CSV (`Dashboard → Importieren`) or create manually
3. Suppliers receive an email with a magic link to update status
4. Monitor **delay risk** and use **Status anfragen** to manually ping suppliers
5. Review **Lieferanten** page for scorecard metrics (worst suppliers first)

### CSV import format

```csv
orderNumber,supplierEmail,partDescription,dueDate,quantity,unit,value
PO-2026-001,lieferant@mueller.de,Hydraulikzylinder 50mm,2026-09-15,10,Stück,18500.00
```

`value` is the order value in EUR and feeds the dashboard's "value at risk" metric.

## Configuration

All required environment variables are in `.env.example`. The API validates env on startup and fails fast if any are missing.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min. 32 characters |
| `SMTP_*` | SMTP relay settings |
| `API_URL` / `WEB_URL` | Public URLs for links and CORS |
| `REMINDER_CRON` | Auto-reminder schedule (default: hourly) |
| `DIGEST_CRON` | Weekly digest schedule (default: Mon 08:00) |

Frontend: set `VITE_API_URL` in `apps/web/.env` (default `http://localhost:3001`).

## Running tests

```bash
# Requires Docker PostgreSQL running
docker compose up -d

pnpm test
```

Unit tests cover delay risk, scorecard, email templates, and Zod schemas. Integration tests cover the auth flow. Frontend tests cover `OrderTable` and `SupplierStatusPage`.

CI runs automatically on push and pull requests to `main`.

## Email testing (development)

MailHog captures all outbound email when using the default `.env.example` SMTP settings (`localhost:1025`). Open http://localhost:8025 to preview supplier notifications, reminders, and weekly digests.

## Deployment

Target hosting: **Hetzner Cloud (Germany)** for DSGVO-compliant data residency.

Suggested server: CX21 (2 vCPU, 4 GB RAM, 40 GB SSD).

See [docs/deployment.md](docs/deployment.md) for nginx, environment, and production checklist.

## Data compliance

- Default deployment region: Germany (Hetzner)
- AVV template: [docs/avv-template.md](docs/avv-template.md)
- Organization deletion: `DELETE /organizations/:id` (authenticated, own org only)
- No employee behavioral tracking; supplier emails used only for transactional notifications

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API won't start — env error | Copy `.env.example` → `.env`, fill all variables |
| Database connection refused | Run `docker compose up -d` and verify port 5432 |
| Emails not sending | Check SMTP settings; use MailHog in dev |
| Frontend 401 loops | Ensure `VITE_API_URL` matches API and CORS `WEB_URL` |
| Prisma client missing | Run `pnpm db:generate` |
| pnpm not found | Enable via `corepack enable` |

## License

MIT — see [LICENSE](LICENSE).
