import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrder } from '../api/orders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { DelayRiskIndicator } from '../components/DelayRiskIndicator';
import { OrderEventTimeline } from '../components/OrderEventTimeline';
import { useI18n } from '../i18n';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const { t, formatDate } = useI18n();

  if (isLoading) return <p className="text-gray-500">{t('common.loading')}</p>;
  if (!order) return <p className="text-risk-red">{t('orderDetail.notFound')}</p>;

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('orderDetail.back')}
      </Link>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold font-mono">{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">{order.partDescription}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <DelayRiskIndicator risk={order.delayRisk} />
          </div>
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-gray-500">{t('orderDetail.supplier')}</dt>
            <dd className="font-medium">{order.supplier.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('orderDetail.dueDate')}</dt>
            <dd className="font-medium">{formatDate(order.dueDate)}</dd>
          </div>
          {order.quantity && (
            <div>
              <dt className="text-gray-500">{t('orderDetail.quantity')}</dt>
              <dd className="font-medium">{order.quantity} {order.unit}</dd>
            </div>
          )}
          {order.statusNote && (
            <div className="col-span-2">
              <dt className="text-gray-500">{t('orderDetail.note')}</dt>
              <dd>{order.statusNote}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">{t('orderDetail.history')}</h2>
        <OrderEventTimeline events={order.events ?? []} />
      </div>
    </div>
  );
}
