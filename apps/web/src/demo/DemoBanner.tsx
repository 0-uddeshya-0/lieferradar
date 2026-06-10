import { ExternalLink } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-brand-900 text-white text-sm px-4 py-2 flex items-center justify-center gap-3">
      <span>
        Interaktive Demo mit Beispieldaten — keine echten Bestellungen oder E-Mails.
      </span>
      <a
        href="https://github.com/0-uddeshya-0/lieferradar"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline hover:text-brand-100"
      >
        GitHub
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
