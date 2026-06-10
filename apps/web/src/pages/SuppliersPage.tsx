import { useState } from 'react';
import { useScorecard } from '../api/dashboard';
import { useSupplier, useCreateSupplier } from '../api/suppliers';
import { SupplierScorecard } from '../components/SupplierScorecard';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { DelayRiskIndicator } from '../components/DelayRiskIndicator';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useI18n } from '../i18n';
import type { DelayRisk, OrderStatus } from '../types';

type Responsiveness = 'gut' | 'mittel' | 'schlecht';

interface ScorecardSupplier {
  id: string;
  name: string;
  totalOrders: number;
  onTimeRate: number;
  avgResponseHours: number;
  delayCount: number;
  unresponsiveCount: number;
  responsiveness: Responsiveness;
}

interface SupplierDetail {
  name: string;
  metrics: {
    onTimeRate: number;
    avgResponseHours: number | null;
    delayCount: number;
    unresponsiveCount: number;
    responsiveness: Responsiveness;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    partDescription: string;
    dueDate: string;
    status: OrderStatus;
    delayRisk: DelayRisk;
  }>;
}

const responsivenessVariant: Record<Responsiveness, 'green' | 'yellow' | 'red'> = {
  gut: 'green',
  mittel: 'yellow',
  schlecht: 'red',
};

const responsivenessOrder: Record<Responsiveness, number> = {
  schlecht: 0,
  mittel: 1,
  gut: 2,
};

export function SuppliersPage() {
  const { data: scorecard } = useScorecard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: supplierDetail } = useSupplier(selectedId ?? '');
  const createSupplier = useCreateSupplier();
  const { t, responsivenessLabel, formatDate } = useI18n();

  const suppliers: ScorecardSupplier[] = scorecard?.suppliers ?? [];
  const sorted = [...suppliers].sort(
    (a, b) => responsivenessOrder[a.responsiveness] - responsivenessOrder[b.responsiveness]
  );
  const detail = supplierDetail as SupplierDetail | undefined;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    await createSupplier.mutateAsync({
      name: form.get('name') as string,
      contactEmail: form.get('contactEmail') as string,
      contactName: (form.get('contactName') as string) || undefined,
    });
    setShowForm(false);
    formEl.reset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t('suppliers.title')}</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {t('suppliers.new')}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border rounded-xl p-4 space-y-3">
            <Input name="name" label={t('suppliers.name')} required />
            <Input name="contactEmail" label={t('suppliers.email')} type="email" required />
            <Input name="contactName" label={t('suppliers.contact')} />
            <Button type="submit" size="sm" disabled={createSupplier.isPending}>
              {t('suppliers.save')}
            </Button>
          </form>
        )}

        <div className="bg-white border rounded-xl overflow-hidden">
          {sorted.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between transition-colors ${
                selectedId === s.id ? 'bg-brand-50' : ''
              }`}
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-500">
                  {s.totalOrders} {t('suppliers.ordersOnTime', { rate: Math.round(s.onTimeRate * 100) })}
                </p>
              </div>
              <Badge variant={responsivenessVariant[s.responsiveness]}>
                {responsivenessLabel(s.responsiveness)}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        {selectedId && detail ? (
          <div className="bg-white border rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold">{detail.name}</h2>
              <Badge variant={responsivenessVariant[detail.metrics.responsiveness]} className="mt-2">
                {responsivenessLabel(detail.metrics.responsiveness)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">{t('suppliers.onTimeRate')}</p>
                <p className="text-xl font-bold">{Math.round(detail.metrics.onTimeRate * 100)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">{t('suppliers.avgResponse')}</p>
                <p className="text-xl font-bold">
                  {detail.metrics.avgResponseHours != null
                    ? `${Math.round(detail.metrics.avgResponseHours)}h`
                    : '–'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">{t('suppliers.delays')}</p>
                <p className="text-xl font-bold">{detail.metrics.delayCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">{t('suppliers.noResponse')}</p>
                <p className="text-xl font-bold">{detail.metrics.unresponsiveCount}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">{t('suppliers.lastOrders')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">{t('orders.col.number')}</th>
                    <th className="py-2">{t('suppliers.col.due')}</th>
                    <th className="py-2">{t('orders.col.status')}</th>
                    <th className="py-2">{t('orders.col.risk')}</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.orders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="py-2 font-mono text-xs">{o.orderNumber}</td>
                      <td className="py-2">{formatDate(o.dueDate)}</td>
                      <td className="py-2"><OrderStatusBadge status={o.status} /></td>
                      <td className="py-2"><DelayRiskIndicator risk={o.delayRisk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-6">
            <SupplierScorecard suppliers={suppliers} />
            <p className="text-gray-500 text-sm mt-4">{t('suppliers.select')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
