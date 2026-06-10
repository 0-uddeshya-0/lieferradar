import { Badge } from './ui/Badge';
import { useI18n } from '../i18n';
import type { OrderStatus } from '../types';

const variantMap: Record<OrderStatus, 'default' | 'green' | 'yellow' | 'red' | 'blue'> = {
  PENDING: 'default',
  RECEIVED: 'blue',
  IN_PROGRESS: 'blue',
  SHIPPED: 'green',
  DELAYED: 'red',
  DELIVERED: 'green',
  CANCELLED: 'default',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { statusLabel } = useI18n();
  return <Badge variant={variantMap[status]}>{statusLabel(status)}</Badge>;
}
