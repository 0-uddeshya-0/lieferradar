import { Badge } from './ui/Badge';
import { useI18n } from '../i18n';

interface SupplierScore {
  id: string;
  name: string;
  totalOrders: number;
  onTimeRate: number;
  avgResponseHours: number;
  delayCount: number;
  unresponsiveCount: number;
  responsiveness: 'gut' | 'mittel' | 'schlecht';
}

const responsivenessVariant = {
  gut: 'green' as const,
  mittel: 'yellow' as const,
  schlecht: 'red' as const,
};

export function SupplierScorecard({ suppliers }: { suppliers: SupplierScore[] }) {
  const { t, responsivenessLabel } = useI18n();
  const sorted = [...suppliers].sort((a, b) => {
    const order = { schlecht: 0, mittel: 1, gut: 2 };
    return order[a.responsiveness] - order[b.responsiveness];
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4">{t('orders.col.supplier')}</th>
            <th className="py-2 pr-4">{t('suppliers.col.rating')}</th>
            <th className="py-2 pr-4">{t('suppliers.col.onTime')}</th>
            <th className="py-2 pr-4">{t('suppliers.col.orders')}</th>
            <th className="py-2">{t('suppliers.noResponse')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium">{s.name}</td>
              <td className="py-3 pr-4">
                <Badge variant={responsivenessVariant[s.responsiveness]}>
                  {responsivenessLabel(s.responsiveness)}
                </Badge>
              </td>
              <td className="py-3 pr-4">{Math.round(s.onTimeRate * 100)}%</td>
              <td className="py-3 pr-4">{s.totalOrders}</td>
              <td className="py-3">{s.unresponsiveCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
