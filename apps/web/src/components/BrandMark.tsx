import { Radar } from 'lucide-react';

export function BrandMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-brand-600 text-white ${className}`}>
      <Radar className="w-4 h-4" />
    </span>
  );
}
