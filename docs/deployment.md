# Deployment

## Recommended infrastructure

- **Provider:** Hetzner Cloud (Germany) — EU data residency
- **Server:** CX21 or larger (2 vCPU, 4 GB RAM, 40 GB SSD)
- **Database:** Managed PostgreSQL or co-located Postgres 16
- **SMTP:** Mailgun, Postmark, or Hetzner-compatible relay

## Build

```bash
pnpm install
pnpm db:generate
pnpm --filter @lieferradar/shared build
pnpm --filter @lieferradar/api build
pnpm --filter @lieferradar/web build
```

Artifacts:

- API: `apps/api/dist/`
- Web: `apps/web/dist/` (static files)

## Environment (production)

Set `NODE_ENV=production` and use strong secrets:

```env
DATABASE_URL="postgresql://user:pass@db-host:5432/lieferradar"
JWT_SECRET="<64+ random characters>"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="..."
SMTP_PASS="..."
EMAIL_FROM_ADDRESS="noreply@yourdomain.de"
API_URL="https://api.yourdomain.de"
WEB_URL="https://app.yourdomain.de"
```

Cookies use `Secure=true` automatically in production.

## Process management

```bash
# API
cd apps/api && node dist/server.js

# Or with PM2
pm2 start apps/api/dist/server.js --name lieferradar-api
```

Serve the web `dist/` folder via nginx or Caddy.

## Nginx example

```nginx
server {
    listen 443 ssl;
    server_name app.yourdomain.de;

    root /var/www/lieferradar/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 443 ssl;
    server_name api.yourdomain.de;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database migrations

```bash
pnpm exec prisma migrate deploy
```

Run on deploy before starting the API.

## Cron jobs

Reminder and digest jobs run inside the API process via `node-cron`. Only one API instance should run cron in production, or extract jobs to a separate worker.

## Checklist

- [ ] Strong `JWT_SECRET` and database credentials
- [ ] HTTPS on both web and API domains
- [ ] `WEB_URL` matches actual frontend origin (CORS)
- [ ] SMTP verified with production relay
- [ ] `prisma migrate deploy` applied
- [ ] MailHog **not** used in production
- [ ] Backups configured for PostgreSQL
