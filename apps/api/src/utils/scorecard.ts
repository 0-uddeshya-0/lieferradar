import { differenceInHours } from 'date-fns';
import type { Order, OrderEvent } from '@prisma/client';

type OrderWithEvents = Order & { events: OrderEvent[] };

export function computeOnTimeRate(orders: OrderWithEvents[]): number {
  const delivered = orders.filter((o) => o.status === 'DELIVERED');
  if (delivered.length === 0) return 1.0;

  const onTime = delivered.filter(
    (o) => !o.events.some((e) => e.status === 'DELAYED')
  );
  return onTime.length / delivered.length;
}

export function computeAvgResponseHours(orders: Order[]): number | null {
  const responded = orders.filter((o) => o.lastSupplierUpdate);
  if (responded.length === 0) return null;

  const hours = responded.map((o) => {
    const from = o.lastReminderSent ?? o.createdAt;
    return differenceInHours(o.lastSupplierUpdate!, from);
  });
  return hours.reduce((a, b) => a + b, 0) / hours.length;
}

export function computeResponsivenessLabel(
  avgResponseHours: number | null,
  unresponsiveCount: number
): 'gut' | 'mittel' | 'schlecht' {
  if (unresponsiveCount > 2) return 'schlecht';
  if (avgResponseHours === null || avgResponseHours > 72) return 'schlecht';
  if (avgResponseHours <= 24) return 'gut';
  return 'mittel';
}

export function countUnresponsive(orders: Order[]): number {
  return orders.filter(
    (o) => o.reminderCount >= 2 && !o.lastSupplierUpdate && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;
}
