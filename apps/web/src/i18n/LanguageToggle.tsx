import { useI18n } from './index';
import { cn } from '../lib/cn';
import type { Lang } from './translations';

const LANGS: Lang[] = ['de', 'en'];

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={cn('inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5', className)}
      role="group"
      aria-label="Sprache / Language"
    >
      {LANGS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLang(value)}
          aria-pressed={lang === value}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors',
            lang === value ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-900'
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
