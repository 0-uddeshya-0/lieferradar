import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BarChart3,
  Mail,
  Smartphone,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: Mail,
    title: 'Magic-Link Statusseiten',
    description: 'Lieferanten aktualisieren den Bestellstatus per Link — ohne Login, mobil optimiert.',
  },
  {
    icon: Bell,
    title: 'Automatisches Nachfassen',
    description: 'Erinnerungen nach 2 und 5 Tagen ohne Antwort. Kein Hinterhertelefonieren mehr.',
  },
  {
    icon: BarChart3,
    title: 'Lieferanten-Scorecard',
    description: 'Pünktlichkeit, Reaktionszeit und Zuverlässigkeit — schlechte Lieferanten zuerst.',
  },
  {
    icon: Smartphone,
    title: 'Risiko-Ampel',
    description: 'Grün, Gelb, Rot pro Bestellung. Überfällige und verzögerte Aufträge sofort sichtbar.',
  },
  {
    icon: Shield,
    title: 'DSGVO-konform',
    description: 'Hosting in Deutschland, AVV-Vorlage, keine Verhaltensanalyse.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-900">LieferRadar</span>
          <Link to="/dashboard">
            <Button size="sm">
              Demo starten
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Weniger Lieferanten hinterhertelefonieren.
            <br />
            <span className="text-brand-600">Weniger verspätete Lieferungen.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            LieferRadar automatisiert Statusanfragen an Lieferanten, zeigt Verzögerungsrisiken
            auf einem Dashboard und berechnet Lieferanten-Zuverlässigkeit — für Einkaufsleiter
            im deutschen Mittelstand.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg">
                Interaktive Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/s/demo">
              <Button size="lg" variant="secondary">
                Lieferanten-Seite ansehen
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border rounded-xl p-6">
                <f.icon className="w-8 h-8 text-brand-600 mb-3" />
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-brand-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <p className="text-3xl font-bold">23</p>
            <p className="text-brand-100 mt-1">Lieferanten-Anfragen automatisiert diesen Monat</p>
            <p className="text-sm text-brand-200 mt-4 max-w-md mx-auto">
              Der ROI-Zähler im Dashboard zeigt Einkaufsleitern sofort, wie viel Nachfassarbeit
              das System übernimmt.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 text-center text-sm text-gray-500">
          <p>
            Vollständige Installation mit API, PostgreSQL und E-Mail-Versand: siehe{' '}
            <a
              href="https://github.com/0-uddeshya-0/lieferradar"
              className="text-brand-600 hover:underline"
            >
              GitHub Repository
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
