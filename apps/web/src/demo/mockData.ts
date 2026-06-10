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
  dueDate: string;
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

export const DEMO_USER = {
  user: { id: 'demo-user', email: 'manager@muster.de', name: 'Thomas Müller' },
  organization: { id: 'demo-org', name: 'Muster Maschinenbau GmbH' },
};

export const DEMO_SUPPLIERS: DemoSupplier[] = [
  { id: 'sup-1', name: 'Hydraulik Müller GmbH', contactEmail: 'lieferant@mueller.de', contactName: 'Klaus Müller' },
  { id: 'sup-2', name: 'Stahlwerk Nord AG', contactEmail: 'info@stahlwerk-nord.de', contactName: 'Anna Schmidt' },
  { id: 'sup-3', name: 'Elektro Bauer & Co.', contactEmail: 'bestellung@elektro-bauer.de', contactName: 'Peter Bauer' },
];

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'PO-2026-089',
    partDescription: 'Hydraulikzylinder 50mm',
    quantity: 10,
    unit: 'Stück',
    dueDate: daysAgo(2),
    status: 'DELAYED',
    delayRisk: 'rot',
    updatedAt: daysAgo(1),
    reminderCount: 2,
    statusNote: 'Materialverzug beim Zulieferer',
    magicToken: 'demo',
    supplier: { id: 'sup-1', name: 'Hydraulik Müller GmbH' },
    events: [
      { id: 'ord-1-ev-1', status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(14) },
      { id: 'ord-1-ev-2', status: 'RECEIVED', note: null, source: 'supplier', createdAt: daysAgo(10) },
      { id: 'ord-1-ev-3', status: 'DELAYED', note: 'Materialverzug beim Zulieferer', source: 'supplier', createdAt: daysAgo(1) },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'PO-2026-102',
    partDescription: 'Stahlblech 3mm S235',
    quantity: 50,
    unit: 'm²',
    dueDate: daysFromNow(1),
    status: 'IN_PROGRESS',
    delayRisk: 'gelb',
    updatedAt: daysAgo(3),
    reminderCount: 1,
    statusNote: null,
    magicToken: 'demo-2',
    supplier: { id: 'sup-2', name: 'Stahlwerk Nord AG' },
    events: [
      { id: 'ord-2-ev-1', status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(9) },
      { id: 'ord-2-ev-2', status: 'IN_PROGRESS', note: null, source: 'supplier', createdAt: daysAgo(3) },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'PO-2026-115',
    partDescription: 'Schaltschrank IP65 800x600',
    quantity: 2,
    unit: 'Stück',
    dueDate: daysFromNow(5),
    status: 'SHIPPED',
    delayRisk: 'gruen',
    updatedAt: daysAgo(0),
    reminderCount: 0,
    statusNote: null,
    magicToken: 'demo-3',
    supplier: { id: 'sup-3', name: 'Elektro Bauer & Co.' },
    events: [
      { id: 'ord-3-ev-1', status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(12) },
      { id: 'ord-3-ev-2', status: 'RECEIVED', note: null, source: 'supplier', createdAt: daysAgo(11) },
      { id: 'ord-3-ev-3', status: 'SHIPPED', note: 'Versand per Spedition', source: 'supplier', createdAt: daysAgo(0) },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: 'PO-2026-078',
    partDescription: 'Kugelgewindetrieb KGT 25',
    quantity: 4,
    unit: 'Stück',
    dueDate: daysAgo(5),
    status: 'PENDING',
    delayRisk: 'rot',
    updatedAt: daysAgo(7),
    reminderCount: 2,
    statusNote: null,
    magicToken: 'demo-4',
    supplier: { id: 'sup-1', name: 'Hydraulik Müller GmbH' },
    events: [
      { id: 'ord-4-ev-1', status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(20) },
    ],
  },
  {
    id: 'ord-5',
    orderNumber: 'PO-2026-120',
    partDescription: 'Drehmomentstütze Typ A',
    quantity: 20,
    unit: 'Stück',
    dueDate: daysFromNow(14),
    status: 'RECEIVED',
    delayRisk: 'gruen',
    updatedAt: daysAgo(1),
    reminderCount: 0,
    statusNote: null,
    magicToken: 'demo-5',
    supplier: { id: 'sup-2', name: 'Stahlwerk Nord AG' },
    events: [
      { id: 'ord-5-ev-1', status: 'PENDING', note: null, source: 'manager', createdAt: daysAgo(4) },
      { id: 'ord-5-ev-2', status: 'RECEIVED', note: null, source: 'supplier', createdAt: daysAgo(1) },
    ],
  },
];

export const DEMO_SUPPLIER_STATUS = {
  orderNumber: 'PO-2026-089',
  partDescription: 'Hydraulikzylinder 50mm',
  quantity: 10,
  unit: 'Stück',
  dueDate: daysAgo(2),
  currentStatus: 'DELAYED' as OrderStatus,
  supplierName: 'Klaus Müller',
  orgName: 'Muster Maschinenbau GmbH',
};
