import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BarChart3,
  CalendarClock,
  Mail,
  ShieldCheck,
  TrafficCone,
  Upload,
  Radar,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';
import { LanguageToggle } from '../i18n/LanguageToggle';
import type { TranslationKey } from '../i18n/translations';

const FEATURES: Array<{ icon: typeof Mail; title: TranslationKey; desc: TranslationKey }> = [
  { icon: Mail, title: 'landing.feature1.title', desc: 'landing.feature1.desc' },
  { icon: Bell, title: 'landing.feature2.title', desc: 'landing.feature2.desc' },
  { icon: BarChart3, title: 'landing.feature3.title', desc: 'landing.feature3.desc' },
  { icon: TrafficCone, title: 'landing.feature4.title', desc: 'landing.feature4.desc' },
  { icon: CalendarClock, title: 'landing.feature5.title', desc: 'landing.feature5.desc' },
  { icon: ShieldCheck, title: 'landing.feature6.title', desc: 'landing.feature6.desc' },
];

const STEPS: Array<{ title: TranslationKey; desc: TranslationKey; icon: typeof Upload }> = [
  { icon: Upload, title: 'landing.how.step1.title', desc: 'landing.how.step1.desc' },
  { icon: Bell, title: 'landing.how.step2.title', desc: 'landing.how.step2.desc' },
  { icon: BarChart3, title: 'landing.how.step3.title', desc: 'landing.how.step3.desc' },
];

function DashboardPreview() {
  const { t } = useI18n();
  const rows: Array<{ no: string; risk: 'rot' | 'gelb' | 'gruen'; status: TranslationKey }> = [
    { no: 'PO-2026-089', risk: 'rot', status: 'orderStatus.DELAYED' },
    { no: 'PO-2026-102', risk: 'gelb', status: 'orderStatus.IN_PROGRESS' },
    { no: 'PO-2026-115', risk: 'gruen', status: 'orderStatus.SHIPPED' },
  ];
  const riskIcon = {
    rot: <AlertCircle className="w-4 h-4 text-risk-red" />,
    gelb: <AlertTriangle className="w-4 h-4 text-risk-yellow" />,
    gruen: <CheckCircle className="w-4 h-4 text-risk-green" />,
  };

  return (
    <div className="relative mx-auto max-w-3xl" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-200/60 to-brand-50 blur-2xl rounded-full" />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-gray-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">{t('dashboard.stats.active')}</p>
              <p className="text-xl font-bold">12</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500">{t('dashboard.stats.overdue')}</p>
              <p className="text-xl font-bold text-risk-red">3</p>
            </div>
            <div className="rounded-lg bg-brand-600 p-3 text-white">
              <p className="text-xs text-brand-100">{t('dashboard.stats.automated')}</p>
              <p className="text-xl font-bold">23</p>
            </div>
          </div>
          <div className="divide-y text-sm">
            {rows.map((row) => (
              <div key={row.no} className="flex items-center justify-between py-2.5">
                <span className="font-mono text-xs text-brand-700">{row.no}</span>
                <span className="text-gray-600">{t(row.status)}</span>
                {riskIcon[row.risk]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white">
              <Radar className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-brand-900">LieferRadar</span>
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/dashboard">
              <Button size="sm">
                {t('landing.cta.demo')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
          <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-14 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('landing.hero.badge')}
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {t('landing.hero.line1')}
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                {t('landing.hero.line2')}
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.hero.sub')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="shadow-lg shadow-brand-600/20">
                  {t('landing.hero.primary')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/s/demo">
                <Button size="lg" variant="secondary">
                  {t('landing.hero.secondary')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative max-w-6xl mx-auto px-4 pb-16">
            <DashboardPreview />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('landing.features.title')}</h2>
            <p className="mt-2 text-gray-600">{t('landing.features.sub')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white border border-gray-200 rounded-xl p-6 transition-shadow hover:shadow-md"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-gray-900">{t(feature.title)}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t(feature.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 border-y">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              {t('landing.how.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg mb-4">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{t(step.title)}</h3>
                  <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">{t(step.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-brand-700 to-brand-500 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <p className="text-5xl font-extrabold">23</p>
            <p className="text-brand-100 mt-2 text-lg">{t('landing.roi.value')}</p>
            <p className="text-sm text-brand-200 mt-4 max-w-md mx-auto leading-relaxed">
              {t('landing.roi.desc')}
            </p>
            <Link to="/dashboard" className="inline-block mt-6">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                {t('landing.hero.primary')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>
            {t('landing.footer.full')}{' '}
            <a
              href="https://github.com/0-uddeshya-0/lieferradar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              {t('landing.footer.repo')}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
