import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '../api/orders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { DelayRiskIndicator } from '../components/DelayRiskIndicator';
import { OrderEventTimeline } from '../components/OrderEventTimeline';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';
import { isDemoMode } from '../demo/config';
import { ORDER_STATUSES, type OrderStatus } from '../types';

function supplierLinkFor(token: string): string {
  const origin = window.location.origin;
  return isDemoMode
    ? `${origin}${import.meta.env.BASE_URL}#/s/${token}`
    : `${origin}/s/${token}`;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus();
  const { t, statusLabel, formatDate, formatCurrency } = useI18n();
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (isLoading) return <p className="text-gray-500">{t('common.loading')}</p>;
  if (!order) return <p className="text-risk-red">{t('orderDetail.notFound')}</p>;

  const handleSave = async () => {
    if (!newStatus) return;
    await updateStatus.mutateAsync({
      id: order.id,
      status: newStatus,
      note: note.trim() || undefined,
    });
    setNewStatus('');
    setNote('');
  };

  const handleCopy = async () => {
    if (!order.magicToken) return;
    try {
      await navigator.clipboard.writeText(supplierLinkFor(order.magicToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (non-secure context) — leave the link selectable
    }
  };

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
          {order.confirmedDate && (
            <div>
              <dt className="text-gray-500">{t('orderDetail.confirmedDate')}</dt>
              <dd
                className={`font-medium ${
                  new Date(order.confirmedDate) > new Date(order.dueDate) ? 'text-risk-red' : ''
                }`}
              >
                {formatDate(order.confirmedDate)}
              </dd>
            </div>
          )}
          {order.valueCents != null && (
            <div>
              <dt className="text-gray-500">{t('orderDetail.value')}</dt>
              <dd className="font-medium">{formatCurrency(order.valueCents)}</dd>
            </div>
          )}
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

        {order.magicToken && (
          <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700">{t('orderDetail.supplierLink')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('orderDetail.linkHint')}</p>
              <p className="text-xs font-mono text-gray-600 mt-1 truncate">
                {supplierLinkFor(order.magicToken)}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-risk-green" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? t('orderDetail.copied') : t('orderDetail.copy')}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">{t('orderDetail.updateStatus')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus | '')}
          >
            <option value="">{t('orders.col.status')}...</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{statusLabel(status)}</option>
            ))}
          </select>
          <input
            type="text"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
            placeholder={t('orderDetail.noteOptional')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!newStatus || updateStatus.isPending}
          >
            {updateStatus.isPending ? t('orderDetail.saving') : t('orderDetail.save')}
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">{t('orderDetail.history')}</h2>
        <OrderEventTimeline events={order.events ?? []} />
      </div>
    </div>
  );
}
