import { OrderStatusEnum } from '@lieferradar/shared';
import type { OrderStatus } from '@lieferradar/shared';

export type {
  OrderStatus,
  CreateOrderInput,
  CreateSupplierInput,
  DelayRisk,
} from '@lieferradar/shared';

export { STATUS_LABELS, RISK_LABELS } from '@lieferradar/shared';

export const ORDER_STATUSES: readonly OrderStatus[] = OrderStatusEnum.options;
