# LieferRadar

**Weniger Lieferanten hinterhertelefonieren. Weniger verspätete Lieferungen.**

LieferRadar is a supplier delay intelligence tool for German manufacturing SMEs. Purchasing and plant managers register open supplier orders, send magic-link status pages to suppliers (no login required), automate follow-up reminders, and monitor delay risk on a live dashboard with supplier reliability scorecards.

## Features

- **Order management** — Create orders manually or import up to 500 rows via CSV
- **Supplier magic links** — Mobile-friendly German status page (`/s/:token`) for suppliers
- **Automated chasing** — Hourly cron sends reminders after 2 and 5 days of silence
- **Dashboard** — Filterable order table with RED/YELLOW/GREEN delay risk indicators
- **Supplier scorecard** — On-time rate, response time, and responsiveness labels per supplier
- **ROI metrics** — Dashboard shows automated supplier requests in the last 30 days
- **Weekly digest** — Monday 08:00 email summary to managers
- **JWT auth** — HttpOnly cookie sessions with refresh token rotation
- **DSGVO-ready** — Organization deletion endpoint and AVV template included

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
git clone <repo-url>
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
orderNumber,supplierEmail,partDescription,dueDate,quantity,unit
PO-2024-001,lieferant@mueller.de,Hydraulikzylinder 50mm,2024-12-15,10,Stück
```

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

## Email testing (development)

MailHog captures all outbound email when using the default `.env.example` SMTP settings (`localhost:1025`). Open http://localhost:8025 to preview supplier notifications, reminders, and weekly digests.

## Data requirements

- **Organizations & users** — Created via registration
- **Suppliers** — Created manually or auto-created during CSV import (matched by email)
- **Orders** — Require supplier, order number, description, and due date

## Outputs

| Output | Location |
|--------|----------|
| Dashboard metrics | `GET /dashboard/summary` |
| Supplier scorecard | `GET /dashboard/scorecard` |
| Order events | Order detail page / `GET /orders/:id` |
| Emails | SMTP → MailHog (dev) or configured relay (prod) |
| Weekly digest | Sent to organization email via cron |

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
