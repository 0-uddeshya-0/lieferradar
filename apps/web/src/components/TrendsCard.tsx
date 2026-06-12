import { useTrends } from '../api/dashboard';
import { useI18n } from '../i18n';

interface MonthRow {
  month: string;
  ordersDue: number;
  delivered: number;
  onTimeRate: number | null;
  delayed: number;
}

const MONTH_LABELS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({
  months,
  value,
  max,
  format,
  barClass,
  monthLabels,
}: {
  months: MonthRow[];
  value: (m: MonthRow) => number | null;
  max: number;
  format: (v: number) => string;
  barClass: (m: MonthRow) => string;
  monthLabels: string[];
}) {
  const width = 280;
  const height = 110;
  const chartHeight = 78;
  const barWidth = 28;
  const gap = (width - months.length * barWidth) / (months.length + 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img">
      {months.map((m, i) => {
        const v = value(m);
        const x = gap + i * (barWidth + gap);
        const h = v === null || max === 0 ? 0 : Math.max(3, (v / max) * chartHeight);
        const label = monthLabels[parseInt(m.month.slice(5), 10) - 1];
        return (
          <g key={m.month}>
            {v !== null ? (
              <>
                <rect
                  x={x}
                  y={14 + chartHeight - h}
                  width={barWidth}
                  height={h}
                  rx={4}
                  className={barClass(m)}
                />
                <text
                  x={x + barWidth / 2}
                  y={10 + chartHeight - h}
                  textAnchor="middle"
                  className="fill-gray-600 text-[9px] font-medium"
                >
                  {format(v)}
                </text>
              </>
            ) : (
              <text
                x={x + barWidth / 2}
                y={14 + chartHeight - 2}
                textAnchor="middle"
                className="fill-gray-300 text-[10px]"
              >
                –
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-gray-400 text-[9px]"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TrendsCard() {
  const { data } = useTrends();
  const { t, lang } = useI18n();
  const monthLabels = lang === 'de' ? MONTH_LABELS_DE : MONTH_LABELS_EN;

  const months = data?.months ?? [];
  if (months.length === 0 || months.every((m) => m.ordersDue === 0)) {
    return null;
  }

  const maxDelayed = Math.max(...months.map((m) => m.delayed), 1);

  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="font-semibold text-gray-900">{t('dashboard.trends.title')}</h2>
      <div className="grid sm:grid-cols-2 gap-6 mt-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('dashboard.trends.onTime')}</p>
          <BarChart
            months={months}
            value={(m) => (m.onTimeRate !== null ? Math.round(m.onTimeRate * 100) : null)}
            max={100}
            format={(v) => `${v}%`}
            barClass={(m) =>
              (m.onTimeRate ?? 1) >= 0.9
                ? 'fill-risk-green/80'
                : (m.onTimeRate ?? 1) >= 0.7
                  ? 'fill-risk-yellow/80'
                  : 'fill-risk-red/80'
            }
            monthLabels={monthLabels}
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('dashboard.trends.delayed')}</p>
          <BarChart
            months={months}
            value={(m) => m.delayed}
            max={maxDelayed}
            format={(v) => String(v)}
            barClass={() => 'fill-brand-400'}
            monthLabels={monthLabels}
          />
        </div>
      </div>
    </div>
  );
}
