import { Badge } from './ui/Badge';
import { STATUS_LABELS, type OrderStatus } from '../types';

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
  return <Badge variant={variantMap[status]}>{STATUS_LABELS[status]}</Badge>;
}
