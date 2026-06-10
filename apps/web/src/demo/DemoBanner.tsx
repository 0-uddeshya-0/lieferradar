import { ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-brand-900 text-white text-sm px-4 py-2 flex items-center justify-center gap-3 flex-wrap">
      <span>{t('demo.banner')}</span>
      <a
        href="https://github.com/0-uddeshya-0/lieferradar"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline hover:text-brand-100"
      >
        {t('demo.github')}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
