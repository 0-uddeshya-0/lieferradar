import { createHmac, randomBytes } from 'crypto';
import { prisma } from '../db';

export type WebhookEvent =
  | 'order.status_changed'
  | 'order.supplier_responded'
  | 'order.reminder_sent';

const DISPATCH_TIMEOUT_MS = 5000;

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`;
}

export function signPayload(secret: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

/**
 * Fire-and-forget delivery: webhook failures must never break the business
 * operation that triggered them.
 */
export async function dispatchWebhook(
  orgId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { webhookUrl: true, webhookSecret: true },
    });
    if (!org?.webhookUrl || !org.webhookSecret) return;

    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data,
    });

    await fetch(org.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LieferRadar-Event': event,
        'X-LieferRadar-Signature': signPayload(org.webhookSecret, body),
      },
      body,
      signal: AbortSignal.timeout(DISPATCH_TIMEOUT_MS),
    });
  } catch {
    // Delivery is best-effort; consumers can poll the API as fallback.
  }
}

export function orderWebhookPayload(order: {
  id: string;
  orderNumber: string;
  status: string;
  statusNote?: string | null;
  dueDate: Date;
  supplier: { id: string; name: string };
}) {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusNote: order.statusNote ?? null,
    dueDate: order.dueDate.toISOString(),
    supplier: { id: order.supplier.id, name: order.supplier.name },
  };
}
