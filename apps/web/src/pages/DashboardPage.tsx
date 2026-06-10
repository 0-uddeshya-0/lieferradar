import { Link } from 'react-router-dom';
import { Upload, Package, CalendarX, TimerOff, BellOff, Zap, Plus } from 'lucide-react';
import { useDashboardSummary } from '../api/dashboard';
import { useOrders, useRemindOrder } from '../api/orders';
import { useSuppliers } from '../api/suppliers';
import { useFilters } from '../hooks/useFilters';
import { OrderTable } from '../components/OrderTable';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';
import { ORDER_STATUSES, type OrderStatus } from '../types';

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  alert,
}: {
  label: string;
  value: number;
  icon: typeof Package;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-xl p-4 shadow-sm'
          : 'bg-white rounded-xl border p-4'
      }
    >
      <div className="flex items-center justify-between">
        <p className={highlight ? 'text-brand-100 text-sm' : 'text-gray-500 text-sm'}>{label}</p>
        <Icon className={`w-4 h-4 shrink-0 ${highlight ? 'text-brand-200' : 'text-gray-400'}`} />
      </div>
      <p
        className={`text-2xl font-bold mt-1 ${
          highlight ? 'text-white' : alert && value > 0 ? 'text-risk-red' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const { filters, updateFilter } = useFilters();
  const { data: summary } = useDashboardSummary();
  const { data: ordersData, isLoading } = useOrders(filters);
  const { data: suppliers } = useSuppliers();
  const remindMutation = useRemindOrder();
  const { t, statusLabel } = useI18n();

  const orders = ordersData?.orders ?? [];

  if (summary?.totalActiveOrders === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('dashboard.empty.title')}</h2>
        <p className="text-gray-500 mb-8">{t('dashboard.empty.sub')}</p>
        <Link to="/import">
          <Button size="lg">
            <Upload className="w-5 h-5 mr-2" />
            {t('dashboard.empty.importCsv')}
          </Button>
        </Link>
        <p className="mt-4">
          <Link to="/orders/new" className="text-sm text-brand-600 hover:underline">
            {t('dashboard.empty.manual')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label={t('dashboard.stats.active')} value={summary?.totalActiveOrders ?? 0} icon={Package} />
        <StatCard label={t('dashboard.stats.overdue')} value={summary?.overdueOrders ?? 0} icon={CalendarX} alert />
        <StatCard label={t('dashboard.stats.delayed')} value={summary?.delayedOrders ?? 0} icon={TimerOff} alert />
        <StatCard label={t('dashboard.stats.silent')} value={summary?.silentSuppliers ?? 0} icon={BellOff} />
        <StatCard
          label={t('dashboard.stats.automated')}
          value={summary?.remindersAutomatedThisMonth ?? 0}
          icon={Zap}
          highlight
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white border rounded-xl p-4">
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-white"
          value={filters.status ?? ''}
          onChange={(e) => updateFilter('status', (e.target.value || undefined) as OrderStatus | undefined)}
        >
          <option value="">{t('dashboard.filter.allStatuses')}</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{statusLabel(status)}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm bg-white"
          value={filters.supplierId ?? ''}
          onChange={(e) => updateFilter('supplierId', e.target.value || undefined)}
        >
          <option value="">{t('dashboard.filter.allSuppliers')}</option>
          {suppliers?.map((s: { id: string; name: string }) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.overdueOnly ?? false}
            onChange={(e) => updateFilter('overdueOnly', e.target.checked || undefined)}
          />
          {t('dashboard.filter.overdueOnly')}
        </label>

        <input
          type="search"
          placeholder={t('dashboard.filter.search')}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          value={filters.search ?? ''}
          onChange={(e) => updateFilter('search', e.target.value || undefined)}
        />

        <Link to="/orders/new" className="ml-auto">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {t('dashboard.newOrder')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">{t('common.loading')}</p>
      ) : (
        <OrderTable
          orders={orders}
          onRemind={(id) => remindMutation.mutate(id)}
          remindingId={remindMutation.isPending ? remindMutation.variables : undefined}
        />
      )}
    </div>
  );
}
