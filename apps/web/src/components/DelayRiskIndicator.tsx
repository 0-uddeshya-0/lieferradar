import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import type { DelayRisk } from '../types';
import { cn } from '../lib/cn';

const config: Record<DelayRisk, { icon: typeof CheckCircle; color: string }> = {
  gruen: { icon: CheckCircle, color: 'text-risk-green' },
  gelb: { icon: AlertTriangle, color: 'text-risk-yellow' },
  rot: { icon: AlertCircle, color: 'text-risk-red' },
};

export function DelayRiskIndicator({ risk }: { risk: DelayRisk }) {
  const { riskLabel } = useI18n();
  const { icon: Icon, color } = config[risk];
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap', color)}>
      <Icon className="w-4 h-4" aria-hidden />
      {riskLabel(risk)}
    </span>
  );
}
