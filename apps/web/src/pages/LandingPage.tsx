import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BarChart3,
  CalendarClock,
  Mail,
  Plug,
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

// Pilot inquiries land here — replace when a dedicated company address exists.
const PILOT_CONTACT = 'amisha223singh@gmail.com';

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
  const { t, formatCurrency } = useI18n();
  const rows: Array<{ no: string; risk: 'rot' | 'gelb' | 'gruen'; status: TranslationKey }> = [
    { no: 'PO-2026-118', risk: 'rot', status: 'orderStatus.DELAYED' },
    { no: 'PO-2026-120', risk: 'gelb', status: 'orderStatus.IN_PROGRESS' },
    { no: 'PO-2026-122', risk: 'gruen', status: 'orderStatus.SHIPPED' },
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
              <p className="text-xs text-gray-500 truncate">{t('dashboard.stats.overdue')}</p>
              <p className="text-xl font-bold text-risk-red tabular-nums">3</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-gray-500 truncate">{t('dashboard.stats.valueAtRisk')}</p>
              <p className="text-xl font-bold text-risk-red tabular-nums">{formatCurrency(3890000)}</p>
            </div>
            <div className="rounded-lg bg-brand-600 p-3 text-white">
              <p className="text-xs text-brand-100 truncate">{t('dashboard.stats.automated')}</p>
              <p className="text-xl font-bold tabular-nums">23</p>
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
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white">
              <Radar className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-brand-900 font-display">LieferRadar</span>
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/dashboard">
              <Button size="sm">
                {t('landing.hero.primary')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative max-w-6xl mx-auto px-4 pt-20 pb-14 text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('landing.hero.badge')}
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="relative max-w-6xl mx-auto px-4 pb-16"
          >
            <DashboardPreview />
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{t('landing.features.title')}</h2>
            <p className="mt-2 text-gray-600">{t('landing.features.sub')}</p>
          </div>
          <div className="grid md:grid-cols-6 gap-5">
            {/* Magic-link cell: large, brand-tinted, with a live miniature of the supplier page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="md:col-span-4 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="flex-1">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-600 text-white mb-4">
                  <Mail className="w-5 h-5" />
                </span>
                <h3 className="font-display font-semibold text-lg text-gray-900">{t('landing.feature1.title')}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t('landing.feature1.desc')}</p>
              </div>
              <div className="w-full md:w-64 shrink-0 rounded-xl border bg-white shadow-sm p-4 space-y-2" aria-hidden>
                <p className="text-xs text-gray-400">PO-2026-118</p>
                <div className="rounded-lg border-2 border-brand-600 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-900">
                  {t('orderStatus.SHIPPED')}
                </div>
                <div className="rounded-lg border-2 border-gray-200 px-3 py-2 text-xs text-gray-600">
                  {t('orderStatus.DELAYED')}
                </div>
                <div className="rounded-lg bg-brand-600 px-3 py-2 text-center text-xs font-medium text-white">
                  {t('status.send')}
                </div>
              </div>
            </motion.div>

            {[FEATURES[1], FEATURES[2], FEATURES[3], FEATURES[4]].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08, ease: 'easeOut' }}
                className={`${i === 0 ? 'md:col-span-2' : 'md:col-span-2'} group bg-white border border-gray-200 rounded-2xl p-6 transition-shadow hover:shadow-md`}
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-5 h-5" />
                </span>
                <h3 className="font-display font-semibold text-gray-900">{t(feature.title)}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t(feature.desc)}</p>
              </motion.div>
            ))}

            {/* DSGVO cell: full-width trust band */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="md:col-span-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 flex items-center gap-4"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-risk-green/10 text-risk-green shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-gray-900">{t('landing.feature6.title')}</h3>
                <p className="text-sm text-gray-600 mt-1">{t('landing.feature6.desc')}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-gray-900 text-white rounded-2xl p-8 md:p-10"
          >
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 shrink-0">
                <Plug className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold">{t('landing.integrations.title')}</h2>
                <p className="mt-2 text-gray-300 leading-relaxed max-w-3xl">{t('landing.integrations.desc')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['REST API', 'Webhooks', 'n8n · Make · Zapier', t('landing.integrations.mcp'), 'CSV', t('landing.integrations.erp')].map((chip) => (
                    <span key={chip} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="bg-gray-50 border-y">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
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

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="border border-brand-200 bg-brand-50/50 rounded-2xl p-8 md:p-10 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{t('landing.pilot.title')}</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('landing.pilot.desc')}</p>
            <a href={`mailto:${PILOT_CONTACT}?subject=LieferRadar%20Pilot`} className="inline-block mt-6">
              <Button size="lg">
                {t('landing.pilot.cta')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <p className="mt-4 text-xs text-gray-500">{t('landing.pilot.note')}</p>
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
    </MotionConfig>
  );
}
