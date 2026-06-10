# Contributing to LieferRadar

Thank you for your interest in contributing.

## Development setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Copy env files: `.env.example` → `.env`, `apps/web/.env.example` → `apps/web/.env`
4. Start services: `docker compose up -d`
5. Migrate and seed: `pnpm db:migrate && pnpm db:seed`
6. Run dev: `pnpm dev`

## Code standards

- **TypeScript strict mode** — no `any` without justification
- **German** for all user-facing strings; English for code and comments
- **Zod validation** on all API request bodies
- **Org scoping** — every protected query must filter by `req.user.orgId`
- **Tests** — add unit tests for business logic; integration tests for API flows

## Pull request process

1. Create a feature branch from `main`
2. Run `pnpm test` and `pnpm build` before opening a PR
3. Keep changes focused; avoid unrelated refactors
4. Update documentation if you change API contracts or env vars

## Reporting issues

Include steps to reproduce, expected vs. actual behavior, and relevant logs (redact secrets).
