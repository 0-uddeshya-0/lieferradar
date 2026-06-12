import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { DelayRiskIndicator } from './DelayRiskIndicator';
import { Button } from './ui/Button';
import { useI18n } from '../i18n';
import type { OrderStatus, DelayRisk } from '../types';

interface Order {
  id: string;
  orderNumber: string;
  partDescription: string;
  dueDate: string;
  confirmedDate?: string | null;
  valueCents?: number | null;
  status: OrderStatus;
  delayRisk: DelayRisk;
  updatedAt: string;
  supplier: { id: string; name: string };
}

interface OrderTableProps {
  orders: Order[];
  onRemind: (id: string) => void;
  remindingId?: string;
}

export function OrderTable({ orders, onRemind, remindingId }: OrderTableProps) {
  const { t, formatDate, formatRelative, formatCurrency } = useI18n();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('orders.empty')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-600">
            <th className="px-4 py-3 font-medium">{t('orders.col.number')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.supplier')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.description')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.dueDate')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('orders.col.value')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.status')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.risk')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.activity')}</th>
            <th className="px-4 py-3 font-medium">{t('orders.col.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs">
                <Link to={`/orders/${order.id}`} className="text-brand-600 hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{order.supplier.name}</td>
              <td className="px-4 py-3 max-w-xs truncate">{order.partDescription}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(order.dueDate)}
                {order.confirmedDate && new Date(order.confirmedDate) > new Date(order.dueDate) && (
                  <span className="block text-xs text-risk-red font-medium">
                    {t('orders.confirmedShort')}: {formatDate(order.confirmedDate)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 tabular-nums">
                {order.valueCents != null ? formatCurrency(order.valueCents) : '-'}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <DelayRiskIndicator risk={order.delayRisk} />
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatRelative(order.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onRemind(order.id)}
                      disabled={remindingId === order.id}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {t('orders.remind')}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
