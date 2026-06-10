#!/usr/bin/env node
/**
 * LieferRadar MCP server.
 *
 * Exposes order tracking, supplier scorecards, and reminder actions to AI
 * agents (Claude, n8n AI nodes, custom assistants) over the Model Context
 * Protocol. Authenticates against a LieferRadar instance with an API key.
 *
 * Required environment:
 *   LIEFERRADAR_API_KEY  — created under Settings → API keys (starts with lr_)
 *   LIEFERRADAR_API_URL  — API base URL (default: http://localhost:3001)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = process.env.LIEFERRADAR_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.LIEFERRADAR_API_KEY;

if (!API_KEY) {
  console.error('LIEFERRADAR_API_KEY is not set. Create a key via POST /settings/api-keys.');
  process.exit(1);
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`LieferRadar API ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

function asResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

const ORDER_STATUS = z.enum([
  'PENDING', 'RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELAYED', 'DELIVERED', 'CANCELLED',
]);

const server = new McpServer({ name: 'lieferradar', version: '0.0.1' });

server.tool(
  'list_orders',
  'List purchase orders with optional filters. Returns orders with delay risk (gruen/gelb/rot), status, due dates, and supplier info.',
  {
    status: ORDER_STATUS.optional().describe('Filter by order status'),
    overdueOnly: z.boolean().optional().describe('Only orders past their due date'),
    search: z.string().optional().describe('Search in order number and part description'),
    supplierId: z.string().optional().describe('Filter by supplier id'),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
  },
  async (args) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) params.set(key, String(value));
    }
    return asResult(await api(`/orders?${params}`));
  }
);

server.tool(
  'get_order',
  'Get one order with its full event history (status changes by supplier and purchasing).',
  { id: z.string().describe('Order id') },
  async ({ id }) => asResult(await api(`/orders/${id}`))
);

server.tool(
  'create_order',
  'Create a purchase order. The supplier is notified by email with a magic status link.',
  {
    supplierId: z.string().describe('Existing supplier id (see list_suppliers)'),
    orderNumber: z.string().describe('PO number, e.g. PO-2026-001'),
    partDescription: z.string().describe('What is being ordered'),
    quantity: z.number().int().positive().optional(),
    unit: z.string().optional().describe('e.g. Stück, kg, m'),
    dueDate: z.string().describe('Due date as ISO 8601 datetime, e.g. 2026-09-15T00:00:00.000Z'),
  },
  async (args) => asResult(await api('/orders', { method: 'POST', body: JSON.stringify(args) }))
);

server.tool(
  'update_order_status',
  'Update an order status on behalf of purchasing (e.g. mark DELIVERED when goods arrive).',
  {
    id: z.string().describe('Order id'),
    status: ORDER_STATUS,
    note: z.string().max(1000).optional(),
  },
  async ({ id, ...body }) =>
    asResult(await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }))
);

server.tool(
  'send_reminder',
  'Send a manual status-request email to the supplier of an order.',
  { id: z.string().describe('Order id') },
  async ({ id }) => asResult(await api(`/orders/${id}/remind`, { method: 'POST' }))
);

server.tool(
  'list_suppliers',
  'List suppliers of the organization with their active orders.',
  {},
  async () => asResult(await api('/suppliers'))
);

server.tool(
  'get_supplier',
  'Get a supplier with reliability metrics (on-time rate, response time, responsiveness) and recent orders.',
  { id: z.string().describe('Supplier id') },
  async ({ id }) => asResult(await api(`/suppliers/${id}`))
);

server.tool(
  'get_scorecard',
  'Get the supplier reliability scorecard for all suppliers (worst performers are the ones to watch).',
  {},
  async () => asResult(await api('/dashboard/scorecard'))
);

server.tool(
  'get_dashboard_summary',
  'Get the current situation: active orders, overdue, delayed, silent suppliers, automated reminders sent in the last 30 days.',
  {},
  async () => asResult(await api('/dashboard/summary'))
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`LieferRadar MCP server connected (API: ${API_URL})`);
