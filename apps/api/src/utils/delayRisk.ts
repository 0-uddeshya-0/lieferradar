import { differenceInDays } from 'date-fns';
import type { OrderStatus } from '@lieferradar/shared';

export type DelayRisk = 'gruen' | 'gelb' | 'rot';

export function computeDelayRisk(order: {
  status: OrderStatus;
  dueDate: Date;
  lastSupplierUpdate: Date | null;
  reminderCount: number;
}): DelayRisk {
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return 'gruen';

  if (order.status === 'DELAYED') return 'rot';

  const today = new Date();
  const daysUntilDue = differenceInDays(order.dueDate, today);
  if (daysUntilDue < 0) return 'rot';

  if (daysUntilDue <= 3 && !order.lastSupplierUpdate) return 'gelb';

  if (order.reminderCount >= 2 && !order.lastSupplierUpdate) return 'gelb';

  if (daysUntilDue <= 7) return 'gelb';

  return 'gruen';
}
