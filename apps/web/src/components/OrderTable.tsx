import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { DelayRiskIndicator } from './DelayRiskIndicator';
import { Button } from './ui/Button';
import { formatDate, formatRelative } from '../lib/dates';
import type { OrderStatus, DelayRisk } from '../types';

interface Order {
  id: string;
  orderNumber: string;
  partDescription: string;
  dueDate: string;
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
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Keine Bestellungen gefunden
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-600">
            <th className="px-4 py-3 font-medium">Bestellnr.</th>
            <th className="px-4 py-3 font-medium">Lieferant</th>
            <th className="px-4 py-3 font-medium">Beschreibung</th>
            <th className="px-4 py-3 font-medium">Fälligkeitsdatum</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Risiko</th>
            <th className="px-4 py-3 font-medium">Letzte Aktivität</th>
            <th className="px-4 py-3 font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">
                <Link to={`/orders/${order.id}`} className="text-brand-600 hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{order.supplier.name}</td>
              <td className="px-4 py-3 max-w-xs truncate">{order.partDescription}</td>
              <td className="px-4 py-3">{formatDate(order.dueDate)}</td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <DelayRiskIndicator risk={order.delayRisk} />
              </td>
              <td className="px-4 py-3 text-gray-500">{formatRelative(order.updatedAt)}</td>
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
                      Status anfragen
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
