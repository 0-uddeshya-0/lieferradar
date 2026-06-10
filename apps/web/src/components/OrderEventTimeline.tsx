import { OrderStatusBadge } from './OrderStatusBadge';
import { useI18n } from '../i18n';
import type { OrderStatus } from '../types';
import type { TranslationKey } from '../i18n/translations';

interface Event {
  id: string;
  status: OrderStatus;
  note?: string | null;
  source: string;
  createdAt: string;
}

const SOURCE_KEYS: Record<string, TranslationKey> = {
  supplier: 'orderDetail.source.supplier',
  manager: 'orderDetail.source.manager',
  system: 'orderDetail.source.system',
};

export function OrderEventTimeline({ events }: { events: Event[] }) {
  const { t, formatDateTime } = useI18n();

  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">{t('orderDetail.noEvents')}</p>;
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
              <span className="text-xs text-gray-500">
                {SOURCE_KEYS[event.source] ? t(SOURCE_KEYS[event.source]) : event.source}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDateTime(event.createdAt)}</p>
            {event.note && <p className="text-sm text-gray-700 mt-1">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
