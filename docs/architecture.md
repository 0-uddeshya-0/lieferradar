# Architecture

## Overview

LieferRadar is a pnpm monorepo with three packages:

| Package | Role | Stack |
|---------|------|-------|
| `@lieferradar/api` | REST API, cron jobs, email | Fastify 4, Prisma, Nodemailer |
| `@lieferradar/web` | Manager dashboard & supplier status UI | React 18, Vite, TanStack Query |
| `@lieferradar/shared` | Validation schemas & labels | Zod, TypeScript |

## Request flow

### Manager workflow

1. Manager authenticates via JWT (httpOnly cookies)
2. Creates or imports orders scoped to their organization
3. API sends initial supplier notification email with magic link
4. Dashboard polls summary and order list endpoints
5. Manager can manually trigger reminders (`POST /orders/:id/remind`)

### Supplier workflow

1. Supplier opens magic link (`GET /s/:token`) — no auth
2. Submits status via `POST /s/:token`
3. API records `OrderEvent`, updates order, emails manager

### Background jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `reminderJob` | `REMINDER_CRON` (default hourly) | Auto-reminders after 2/5 days silence |
| `digestJob` | `DIGEST_CRON` (default Mon 08:00) | Weekly summary email per org |

Jobs are disabled when `NODE_ENV=test`.

## Security model

- JWT access tokens (15 min) + DB-backed refresh tokens (rotated on use)
- Rate limits: login (5/min), register (3/hour), supplier status (10/hour/token)
- CORS restricted to `WEB_URL` in production
- All protected routes use `requireAuth` middleware
- Magic tokens are opaque `cuid()` values

## Key modules

```
apps/api/src/
├── routes/          # HTTP endpoints
├── services/        # Business logic (orders, suppliers, email, reminders)
├── jobs/            # Cron schedulers
├── utils/           # delayRisk, scorecard computation
└── plugins/         # auth, cors, rateLimit
```

## Frontend routing

| Route | Auth | Page |
|-------|------|------|
| `/login` | Public | Login / register |
| `/dashboard` | Protected | Order overview |
| `/orders/:id` | Protected | Order detail + timeline |
| `/orders/new` | Protected | Manual order form |
| `/suppliers` | Protected | Supplier scorecard |
| `/import` | Protected | CSV upload |
| `/s/:token` | Public | Supplier status page |
