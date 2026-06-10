import { cn } from '../../lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-gray-100 text-gray-800',
        variant === 'green' && 'bg-green-100 text-green-800',
        variant === 'yellow' && 'bg-yellow-100 text-yellow-800',
        variant === 'red' && 'bg-red-100 text-red-800',
        variant === 'blue' && 'bg-brand-100 text-brand-900',
        className
      )}
    >
      {children}
    </span>
  );
}
