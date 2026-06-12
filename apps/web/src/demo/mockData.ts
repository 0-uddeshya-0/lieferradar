import type { OrderStatus, DelayRisk } from '../types';

const now = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const daysAgo = (n: number) => daysFromNow(-n);

export interface DemoEvent {
  id: string;
  status: OrderStatus;
  note: string | null;
  source: 'manager' | 'supplier' | 'system';
  createdAt: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  partDescription: string;
  quantity?: number;
  unit?: string;
  valueCents: number | null;
  dueDate: string;
  confirmedDate: string | null;
  status: OrderStatus;
  delayRisk: DelayRisk;
  updatedAt: string;
  reminderCount: number;
  statusNote: string | null;
  magicToken: string;
  supplier: { id: string; name: string };
  events: DemoEvent[];
}

export interface DemoSupplier {
  id: string;
  name: string;
  contactEmail: string;
  contactName?: string;
}

export interface DemoMember {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const DEMO_USER = {
  user: { id: 'demo-user', email: 'manager@muster.de', name: 'Thomas Müller' },
  organization: { id: 'demo-org', name: 'Muster Maschinenbau GmbH' },
};

export const DEMO_MEMBERS: DemoMember[] = [
  { id: 'usr-1', name: 'Thomas Müller', email: 'manager@muster.de', createdAt: daysAgo(220) },
  { id: 'usr-2', name: 'Sabine Koch', email: 's.koch@muster.de', createdAt: daysAgo(180) },
  { id: 'usr-3', name: 'Jens Albrecht', email: 'j.albrecht@muster.de', createdAt: daysAgo(95) },
];

export const DEMO_SUPPLIERS: DemoSupplier[] = [
  { id: 'sup-1', name: 'Hydraulik Müller GmbH', contactEmail: 'lieferant@mueller.de', contactName: 'Klaus Müller' },
  { id: 'sup-2', name: 'Stahlwerk Nord AG', contactEmail: 'info@stahlwerk-nord.de', contactName: 'Anna Schmidt' },
  { id: 'sup-3', name: 'Elektro Bauer & Co.', contactEmail: 'bestellung@elektro-bauer.de', contactName: 'Peter Bauer' },
  { id: 'sup-4', name: 'Dichtungstechnik Weber KG', contactEmail: 'vertrieb@weber-dichtungen.de', contactName: 'Martina Weber' },
  { id: 'sup-5', name: 'Zerspanung Hofmann GmbH', contactEmail: 'auftrag@hofmann-cnc.de', contactName: 'Stefan Hofmann' },
  { id: 'sup-6', name: 'Pneumatik Krause', contactEmail: 'info@pneumatik-krause.de', contactName: 'Dirk Krause' },
  { id: 'sup-7', name: 'Lacktechnik Sommer GmbH', contactEmail: 'order@lack-sommer.de', contactName: 'Julia Sommer' },
  { id: 'sup-8', name: 'Federn Vogel & Sohn', contactEmail: 'bestellung@federn-vogel.de', contactName: 'Heinz Vogel' },
];

interface OrderSpec {
  sup: number; // index into DEMO_SUPPLIERS
  part: string;
  qty?: number;
  unit?: string;
  /** EUR */
  value: number;
  /** days relative to today */
  due: number;
  status: OrderStatus;
  /** days relative to today; only when supplier confirmed a date */
  confirmed?: number;
  reminders?: number;
  note?: string;
  /** days ago the order was created (defaults derived from due) */
  created?: number;
}

// 30 orders over ~5 months: 17 closed (history for trends/scorecard),
// 13 open (today's work). Values sized like a real machine builder's POs.
const SPECS: OrderSpec[] = [
  // --- Closed history (delivered/cancelled), oldest first ---
  { sup: 1, part: 'Stahlblech 5mm S355', qty: 120, unit: 'm²', value: 14400, due: -150, status: 'DELIVERED', created: 175 },
  { sup: 0, part: 'Hydraulikpumpe HP-250', qty: 2, unit: 'Stück', value: 8900, due: -140, status: 'DELIVERED', created: 168, note: 'Materialengpass', reminders: 2 },
  { sup: 2, part: 'Frequenzumrichter 7,5kW', qty: 4, unit: 'Stück', value: 5200, due: -132, status: 'DELIVERED', created: 160 },
  { sup: 4, part: 'Drehteile Welle D40', qty: 60, unit: 'Stück', value: 7800, due: -120, status: 'DELIVERED', created: 150 },
  { sup: 3, part: 'O-Ring-Sortiment NBR', qty: 500, unit: 'Stück', value: 950, due: -115, status: 'DELIVERED', created: 140 },
  { sup: 0, part: 'Hydraulikzylinder 80mm', qty: 6, unit: 'Stück', value: 12600, due: -98, status: 'DELIVERED', created: 130, reminders: 2, note: 'Verzögerung Rohmaterial' },
  { sup: 5, part: 'Pneumatikventile 5/2', qty: 24, unit: 'Stück', value: 3100, due: -90, status: 'DELIVERED', created: 115 },
  { sup: 1, part: 'Rundstahl C45 D60', qty: 800, unit: 'kg', value: 2400, due: -82, status: 'DELIVERED', created: 105 },
  { sup: 6, part: 'Pulverbeschichtung Gehäuse', qty: 40, unit: 'Stück', value: 4600, due: -75, status: 'DELIVERED', created: 100 },
  { sup: 7, part: 'Druckfedern 2,5x32', qty: 1000, unit: 'Stück', value: 1800, due: -65, status: 'DELIVERED', created: 88 },
  { sup: 2, part: 'Schaltschrank IP54 600x800', qty: 1, unit: 'Stück', value: 6700, due: -58, status: 'DELIVERED', created: 85 },
  { sup: 4, part: 'Frästeile Adapterplatte', qty: 30, unit: 'Stück', value: 5400, due: -50, status: 'DELIVERED', created: 75 },
  { sup: 0, part: 'Dichtsatz Zylinder 50mm', qty: 12, unit: 'Stück', value: 1450, due: -42, status: 'DELIVERED', created: 60, reminders: 1, note: 'Lieferung in zwei Teilen' },
  { sup: 3, part: 'Flachdichtungen Klingersil', qty: 200, unit: 'Stück', value: 760, due: -35, status: 'DELIVERED', created: 55 },
  { sup: 5, part: 'Wartungseinheit 1/2"', qty: 8, unit: 'Stück', value: 1900, due: -28, status: 'DELIVERED', created: 48 },
  { sup: 1, part: 'Stahlblech 3mm S235 (Storno)', qty: 50, unit: 'm²', value: 4200, due: -25, status: 'CANCELLED', created: 45 },
  { sup: 6, part: 'Nasslackierung Abdeckhauben', qty: 16, unit: 'Stück', value: 2800, due: -15, status: 'DELIVERED', created: 38 },

  // --- Open orders (today's dashboard) ---
  { sup: 0, part: 'Hydraulikzylinder 50mm', qty: 10, unit: 'Stück', value: 18500, due: -4, status: 'DELAYED', confirmed: 9, reminders: 2, note: 'Materialverzug beim Zulieferer', created: 30 },
  { sup: 0, part: 'Kugelgewindetrieb KGT 25', qty: 4, unit: 'Stück', value: 9200, due: -6, status: 'PENDING', reminders: 2, created: 28 },
  { sup: 1, part: 'Stahlblech 3mm S235', qty: 50, unit: 'm²', value: 4300, due: 1, status: 'IN_PROGRESS', reminders: 1, created: 21 },
  { sup: 4, part: 'Drehteile Flansch D120', qty: 25, unit: 'Stück', value: 11200, due: -2, status: 'IN_PROGRESS', confirmed: 6, reminders: 1, note: 'Maschinenausfall, neuer Termin bestätigt', created: 26 },
  { sup: 2, part: 'Schaltschrank IP65 800x600', qty: 2, unit: 'Stück', value: 13400, due: 5, status: 'SHIPPED', confirmed: 4, created: 18 },
  { sup: 3, part: 'Hydraulikdichtungen Viton', qty: 80, unit: 'Stück', value: 2100, due: 4, status: 'RECEIVED', confirmed: 4, created: 12 },
  { sup: 5, part: 'Pneumatikzylinder ISO 15552', qty: 12, unit: 'Stück', value: 5600, due: 7, status: 'IN_PROGRESS', confirmed: 7, created: 15 },
  { sup: 6, part: 'Pulverbeschichtung Rahmen RAL7016', qty: 20, unit: 'Stück', value: 3900, due: 9, status: 'RECEIVED', created: 10 },
  { sup: 7, part: 'Zugfedern 1,6x18', qty: 500, unit: 'Stück', value: 980, due: 11, status: 'PENDING', reminders: 1, created: 9 },
  { sup: 1, part: 'Rohrprofil 60x40x3', qty: 300, unit: 'm', value: 6800, due: 14, status: 'RECEIVED', confirmed: 13, created: 8 },
  { sup: 2, part: 'Servomotor 3kW mit Geber', qty: 3, unit: 'Stück', value: 8700, due: 16, status: 'IN_PROGRESS', confirmed: 15, created: 7 },
  { sup: 4, part: 'Frästeile Lagerbock', qty: 18, unit: 'Stück', value: 7300, due: 21, status: 'RECEIVED', created: 5 },
  { sup: 7, part: 'Tellerfedern DIN 2093', qty: 400, unit: 'Stück', value: 1300, due: 24, status: 'PENDING', created: 3 },
];

const CLOSED: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

function buildEvents(spec: OrderSpec, idx: number, createdDaysAgo: number): DemoEvent[] {
  const events: DemoEvent[] = [
    { id: `ord-${idx}-ev-0`, status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(createdDaysAgo) },
  ];
  const progression: OrderStatus[] =
    spec.status === 'DELIVERED'
      ? spec.note
        // Orders that had trouble went through a DELAYED phase before arriving.
        ? ['RECEIVED', 'DELAYED', 'SHIPPED', 'DELIVERED']
        : ['RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED']
      : spec.status === 'CANCELLED'
        ? ['CANCELLED']
        : spec.status === 'PENDING'
          ? []
          : spec.status === 'DELAYED'
            ? ['RECEIVED', 'DELAYED']
            : (['RECEIVED', 'IN_PROGRESS', 'SHIPPED'] as OrderStatus[]).slice(
                0,
                ['RECEIVED', 'IN_PROGRESS', 'SHIPPED'].indexOf(spec.status) + 1
              );

  const lastDay = CLOSED.includes(spec.status) ? -spec.due : Math.max(1, createdDaysAgo - 18);
  progression.forEach((status, i) => {
    const day = Math.round(
      createdDaysAgo - ((createdDaysAgo - lastDay) * (i + 1)) / (progression.length + 0.5)
    );
    events.push({
      id: `ord-${idx}-ev-${i + 1}`,
      status,
      note: status === 'DELAYED' ? spec.note ?? null : i === progression.length - 1 ? spec.note ?? null : null,
      source: status === 'CANCELLED' ? 'manager' : 'supplier',
      createdAt: daysAgo(Math.max(0, day)),
    });
  });
  return events;
}

function computeRisk(spec: OrderSpec): DelayRisk {
  if (CLOSED.includes(spec.status)) return 'gruen';
  if (spec.status === 'DELAYED') return 'rot';
  if (spec.confirmed !== undefined && spec.confirmed > spec.due) return 'rot';
  if (spec.due < 0) return 'rot';
  if (spec.due <= 7) return 'gelb';
  if ((spec.reminders ?? 0) >= 2) return 'gelb';
  return 'gruen';
}

export const DEMO_ORDERS: DemoOrder[] = SPECS.map((spec, idx) => {
  const created = spec.created ?? Math.abs(spec.due) + 20;
  const supplier = DEMO_SUPPLIERS[spec.sup];
  const events = buildEvents(spec, idx, created);
  const lastEvent = events[events.length - 1];
  const number = `PO-2026-${String(101 + idx).padStart(3, '0')}`;
  return {
    id: `ord-${idx + 1}`,
    orderNumber: number,
    partDescription: spec.part,
    quantity: spec.qty,
    unit: spec.unit,
    valueCents: Math.round(spec.value * 100),
    dueDate: daysFromNow(spec.due),
    confirmedDate: spec.confirmed !== undefined ? daysFromNow(spec.confirmed) : null,
    status: spec.status,
    delayRisk: computeRisk(spec),
    updatedAt: lastEvent.createdAt,
    reminderCount: spec.reminders ?? 0,
    statusNote: spec.note ?? null,
    magicToken: idx === 17 ? 'demo' : `demo-${idx + 1}`,
    supplier: { id: supplier.id, name: supplier.name },
    events,
  };
});

export const DEMO_SUPPLIER_STATUS = {
  orderNumber: 'PO-2026-118',
  partDescription: 'Hydraulikzylinder 50mm',
  quantity: 10,
  unit: 'Stück',
  dueDate: daysAgo(4),
  confirmedDate: daysFromNow(9),
  currentStatus: 'DELAYED' as OrderStatus,
  supplierName: 'Klaus Müller',
  orgName: 'Muster Maschinenbau GmbH',
};
