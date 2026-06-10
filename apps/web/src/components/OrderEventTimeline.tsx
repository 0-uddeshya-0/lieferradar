import { OrderStatusBadge } from './OrderStatusBadge';
import { formatDateTime } from '../lib/dates';
import type { OrderStatus } from '../types';

interface Event {
  id: string;
  status: OrderStatus;
  note?: string | null;
  source: string;
  createdAt: string;
}

const sourceLabels: Record<string, string> = {
  supplier: 'Lieferant',
  manager: 'Einkauf',
  system: 'System',
};

export function OrderEventTimeline({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">Keine Ereignisse</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-brand-600" />
            {i < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={event.status} />
              <span className="text-xs text-gray-500">{sourceLabels[event.source] ?? event.source}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.createdAt)}</p>
            {event.note && <p className="text-sm text-gray-700 mt-1">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
