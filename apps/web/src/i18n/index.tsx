import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { de as deLocale, enGB } from 'date-fns/locale';
import { translations, type Lang, type TranslationKey } from './translations';
import type { OrderStatus, DelayRisk } from '../types';

const STORAGE_KEY = 'lieferradar.lang';

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en') return stored;
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through to default
  }
  return 'de';
}

export interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  statusLabel: (status: OrderStatus) => string;
  riskLabel: (risk: DelayRisk) => string;
  responsivenessLabel: (value: 'gut' | 'mittel' | 'schlecht') => string;
  formatDate: (date: string | Date) => string;
  formatDateTime: (date: string | Date) => string;
  formatRelative: (date: string | Date) => string;
}

function buildI18n(lang: Lang, setLang: (lang: Lang) => void): I18n {
  const dict = translations[lang];
  const dateLocale = lang === 'de' ? deLocale : enGB;
  const datePattern = lang === 'de' ? 'dd.MM.yyyy' : 'dd MMM yyyy';
  const dateTimePattern = lang === 'de' ? 'dd.MM.yyyy HH:mm' : 'dd MMM yyyy HH:mm';

  const t: I18n['t'] = (key, params) => {
    let text = dict[key] ?? translations.de[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  };

  return {
    lang,
    setLang,
    t,
    statusLabel: (status) => t(`orderStatus.${status}` as TranslationKey),
    riskLabel: (risk) => t(`risk.${risk}` as TranslationKey),
    responsivenessLabel: (value) => t(`responsiveness.${value}` as TranslationKey),
    formatDate: (date) => format(new Date(date), datePattern, { locale: dateLocale }),
    formatDateTime: (date) => format(new Date(date), dateTimePattern, { locale: dateLocale }),
    formatRelative: (date) =>
      formatDistanceToNow(new Date(date), { addSuffix: true, locale: dateLocale }),
  };
}

const I18nContext = createContext<I18n>(buildI18n('de', () => {}));

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // persistence is best-effort
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => buildI18n(lang, setLang), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
