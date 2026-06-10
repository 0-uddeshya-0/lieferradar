# API Reference

Base URL: `http://localhost:3001` (development)

Authentication: httpOnly cookies (`accessToken`, `refreshToken`) for the web app — send requests with `credentials: include`. For integrations, use an API key instead: `Authorization: Bearer lr_...` works on every protected route. See [integrations.md](integrations.md).

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create organization + first user |
| POST | `/auth/login` | No | Login, set cookies |
| POST | `/auth/logout` | No | Clear refresh token and cookies |
| POST | `/auth/refresh` | Cookie | Rotate refresh token, issue new access token |
| GET | `/auth/me` | Yes | Current user and organization |

### Register body

```json
{
  "orgName": "Muster GmbH",
  "email": "manager@example.de",
  "password": "min8chars",
  "name": "Max Mustermann"
}
```

## Orders

All routes require authentication. Scoped to caller's `orgId`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List with filters (`status`, `supplierId`, `overdueOnly`, `search`, pagination, sort) |
| POST | `/orders` | Create order (sends supplier email) |
| GET | `/orders/:id` | Order with events and delay risk |
| PATCH | `/orders/:id/status` | Manager status update |
| DELETE | `/orders/:id` | Cancel order |
| POST | `/orders/import` | CSV bulk import (multipart, max 5 MB) |
| POST | `/orders/:id/remind` | Manual "Status anfragen" |

## Suppliers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/suppliers` | List suppliers |
| POST | `/suppliers` | Create supplier |
| GET | `/suppliers/:id` | Supplier detail with metrics and recent orders |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | Header stats + ROI metrics |
| GET | `/dashboard/scorecard` | Per-supplier reliability data |

### Summary response (excerpt)

```json
{
  "totalActiveOrders": 12,
  "overdueOrders": 3,
  "delayedOrders": 1,
  "silentSuppliers": 2,
  "remindersAutomatedThisMonth": 23,
  "supplierResponsesThisMonth": 8,
  "estimatedCallsAvoided": 23
}
```

## Supplier status (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/s/:token` | Order details for supplier page |
| POST | `/s/:token` | Submit status update |

### POST body

```json
{
  "status": "RECEIVED | IN_PROGRESS | SHIPPED | DELAYED",
  "note": "Required when status is DELAYED"
}
```

## Organizations

| Method | Path | Description |
|--------|------|-------------|
| DELETE | `/organizations/:id` | Delete org and all data (DSGVO erasure) |

## Settings (integrations)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/settings/api-keys` | Create API key (plaintext returned once) |
| GET | `/settings/api-keys` | List keys (name, createdAt, lastUsedAt) |
| DELETE | `/settings/api-keys/:id` | Revoke key |
| PUT | `/settings/webhook` | Set HTTPS webhook URL (returns signing secret once) |
| GET | `/settings/webhook` | Current webhook URL |
| DELETE | `/settings/webhook` | Remove webhook |

Webhook events and signature verification: see [integrations.md](integrations.md).

## Error format

```json
{ "error": "German error message" }
```

Common status codes: `401` (unauthorized), `403` (forbidden), `404` (not found), `409` (conflict), `410` (closed order on supplier page).
