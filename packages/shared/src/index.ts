export * from './schemas/order';
export * from './schemas/supplier';
export * from './schemas/auth';

export const STATUS_LABELS = {
  PENDING: 'Ausstehend',
  RECEIVED: 'Bestellung erhalten',
  IN_PROGRESS: 'In Bearbeitung',
  SHIPPED: 'Versendet',
  DELAYED: 'Verzögert',
  DELIVERED: 'Geliefert',
  CANCELLED: 'Storniert',
} as const;

export const RISK_LABELS = {
  gruen: 'Planmäßig',
  gelb: 'Risiko',
  rot: 'Kritisch',
} as const;

export type DelayRisk = keyof typeof RISK_LABELS;
