# Integrations

LieferRadar is built API-first so it drops into existing workflows instead of
demanding new ones. Three integration layers exist today; ERP connectors are
the next milestone.

## 1. API keys

Every endpoint that works with a browser session also accepts an API key.

```bash
# Create a key (authenticated as a user, returns the plaintext key once)
curl -X POST https://api.example.de/settings/api-keys \
  -H "Content-Type: application/json" \
  --cookie "accessToken=..." \
  -d '{"name": "ERP-Connector"}'

# Use it
curl https://api.example.de/orders?overdueOnly=true \
  -H "Authorization: Bearer lr_..."
```

Keys are stored as SHA-256 hashes, scoped to one organization, and revocable
under `DELETE /settings/api-keys/:id`. `lastUsedAt` shows whether a key is
still in use before you revoke it.

## 2. Webhooks

Register one HTTPS endpoint per organization:

```bash
curl -X PUT https://api.example.de/settings/webhook \
  --cookie "accessToken=..." \
  -H "Content-Type: application/json" \
  -d '{"url": "https://hooks.example.de/lieferradar"}'
# → returns { "url": ..., "secret": "whsec_..." }  (secret shown once)
```

Events:

| Event | Fired when |
|---|---|
| `order.supplier_responded` | A supplier submits a status via magic link |
| `order.status_changed` | Purchasing or the system changes an order status |
| `order.reminder_sent` | An automatic or manual reminder email goes out |

Payload:

```json
{
  "event": "order.supplier_responded",
  "timestamp": "2026-06-11T08:30:00.000Z",
  "data": {
    "orderId": "...", "orderNumber": "PO-2026-089",
    "status": "DELAYED", "statusNote": "Materialverzug",
    "dueDate": "2026-06-15T00:00:00.000Z",
    "supplier": { "id": "...", "name": "Hydraulik Müller GmbH" }
  }
}
```

Verify authenticity with the `X-LieferRadar-Signature` header
(`sha256=` + HMAC-SHA256 of the raw body using your `whsec_` secret):

```js
const crypto = require('crypto');
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
```

Delivery is at-most-once with a 5-second timeout; poll the REST API as the
source of truth if your endpoint was down.

### n8n / Make / Zapier

Use a Webhook trigger node pointed at the URL you registered, then branch on
`event`. Typical recipes:

- `order.supplier_responded` with `status = DELAYED` → create a task in your
  project tool and post to the purchasing channel
- `order.reminder_sent` three times for the same supplier → notify the buyer
  to pick up the phone
- nightly schedule → `GET /orders?overdueOnly=true` → spreadsheet for the
  morning meeting

## 3. MCP server (AI agents)

`packages/mcp` ships an MCP server so AI assistants can operate LieferRadar
directly — ask "which suppliers are silent this week?" or "send a reminder for
all overdue orders from Müller" and let the agent call the tools.

```jsonc
// e.g. Claude Desktop / Claude Code MCP configuration
{
  "mcpServers": {
    "lieferradar": {
      "command": "node",
      "args": ["/path/to/lieferradar/packages/mcp/dist/index.js"],
      "env": {
        "LIEFERRADAR_API_URL": "https://api.example.de",
        "LIEFERRADAR_API_KEY": "lr_..."
      }
    }
  }
}
```

Tools: `list_orders`, `get_order`, `create_order`, `update_order_status`,
`send_reminder`, `list_suppliers`, `get_supplier`, `get_scorecard`,
`get_dashboard_summary`. The server is a thin wrapper over the REST API, so
org scoping and validation are enforced server-side, not by the agent.

## 4. CSV-watch connector (any ERP, today)

`packages/csv-watch` ships a small agent that watches a folder for CSV exports
and imports each new file via the API. Point your ERP's existing export job
(or a scheduled report) at the folder; no ERP-side installation.

```bash
pnpm --filter @lieferradar/csv-watch build

LIEFERRADAR_API_URL=https://api.example.de \
LIEFERRADAR_API_KEY=lr_... \
LIEFERRADAR_WATCH_DIR=/srv/erp-exports/lieferradar \
node packages/csv-watch/dist/index.js
```

Processed files move to `processed/`, failures to `failed/`, both timestamped,
so the folder doubles as an audit trail. Run it under systemd or as a Windows
scheduled task next to the ERP.

Expected CSV columns: `orderNumber, supplierEmail, partDescription, dueDate`
plus optional `quantity, unit, value` (value in EUR, e.g. `1234.56`).

## 5. Native ERP connectors (roadmap)

1. **SAP Business One** — Service Layer / DI-API: open POs in, statuses back
2. **proAlpha / abas** — REST interfaces, same pattern

The connector strategy is deliberate: meet the ERP where it is, never require
the supplier to touch it.
