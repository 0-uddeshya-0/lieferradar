import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useDashboardSummary } from '../api/dashboard';
import { useOrders, useRemindOrder } from '../api/orders';
import { useSuppliers } from '../api/suppliers';
import { useFilters } from '../hooks/useFilters';
import { OrderTable } from '../components/OrderTable';
import { Button } from '../components/ui/Button';
import { STATUS_LABELS, type OrderStatus } from '../types';

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? 'bg-brand-600 text-white rounded-lg p-4 shadow-sm'
          : 'bg-white rounded-lg border p-4'
      }
    >
      <p className={highlight ? 'text-brand-100 text-sm' : 'text-gray-500 text-sm'}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { filters, updateFilter } = useFilters();
  const { data: summary } = useDashboardSummary();
  const { data: ordersData, isLoading } = useOrders(filters);
  const { data: suppliers } = useSuppliers();
  const remindMutation = useRemindOrder();

  const orders = ordersData?.orders ?? [];

  if (summary?.totalActiveOrders === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Willkommen bei LieferRadar</h2>
        <p className="text-gray-500 mb-8">Importieren Sie Ihre offenen Bestellungen aus Ihrem ERP oder Excel.</p>
        <Link to="/import">
          <Button size="lg">
            <Upload className="w-5 h-5 mr-2" />
            Bestellungen importieren (CSV)
          </Button>
        </Link>
        <p className="mt-4">
          <Link to="/orders/new" className="text-sm text-brand-600 hover:underline">
            Oder Bestellung manuell anlegen
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Aktive Bestellungen" value={summary?.totalActiveOrders ?? 0} />
        <StatCard label="Überfällig" value={summary?.overdueOrders ?? 0} />
        <StatCard label="Verzögert" value={summary?.delayedOrders ?? 0} />
        <StatCard label="Lieferanten still" value={summary?.silentSuppliers ?? 0} />
        <StatCard
          label="Anfragen automatisiert (30 Tage)"
          value={summary?.remindersAutomatedThisMonth ?? 0}
          highlight
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white border rounded-lg p-4">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filters.status ?? ''}
          onChange={(e) => updateFilter('status', (e.target.value || undefined) as OrderStatus | undefined)}
        >
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filters.supplierId ?? ''}
          onChange={(e) => updateFilter('supplierId', e.target.value || undefined)}
        >
          <option value="">Alle Lieferanten</option>
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
          Nur überfällige
        </label>

        <input
          type="search"
          placeholder="Suchen..."
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          value={filters.search ?? ''}
          onChange={(e) => updateFilter('search', e.target.value || undefined)}
        />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Laden...</p>
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
