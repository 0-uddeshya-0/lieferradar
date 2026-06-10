import type { OrderStatus, DelayRisk } from '../types';

const now = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const daysAgo = (n: number) => daysFromNow(-n);

export const DEMO_USER = {
  user: { id: 'demo-user', email: 'manager@muster.de', name: 'Thomas Müller' },
  organization: { id: 'demo-org', name: 'Muster Maschinenbau GmbH' },
};

export const DEMO_SUMMARY = {
  totalActiveOrders: 12,
  overdueOrders: 3,
  delayedOrders: 2,
  silentSuppliers: 1,
  ordersUpdatedToday: 2,
  remindersAutomatedThisMonth: 23,
  supplierResponsesThisMonth: 8,
  estimatedCallsAvoided: 23,
};

export const DEMO_SUPPLIERS = [
  { id: 'sup-1', name: 'Hydraulik Müller GmbH', contactEmail: 'lieferant@mueller.de', contactName: 'Klaus Müller' },
  { id: 'sup-2', name: 'Stahlwerk Nord AG', contactEmail: 'info@stahlwerk-nord.de', contactName: 'Anna Schmidt' },
  { id: 'sup-3', name: 'Elektro Bauer & Co.', contactEmail: 'bestellung@elektro-bauer.de', contactName: 'Peter Bauer' },
];

export const DEMO_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: 'PO-2024-089',
    partDescription: 'Hydraulikzylinder 50mm',
    quantity: 10,
    unit: 'Stück',
    dueDate: daysAgo(2),
    status: 'DELAYED' as OrderStatus,
    delayRisk: 'rot' as DelayRisk,
    updatedAt: daysAgo(1),
    reminderCount: 2,
    supplier: { id: 'sup-1', name: 'Hydraulik Müller GmbH' },
  },
  {
    id: 'ord-2',
    orderNumber: 'PO-2024-102',
    partDescription: 'Stahlblech 3mm S235',
    quantity: 50,
    unit: 'm²',
    dueDate: daysFromNow(1),
    status: 'IN_PROGRESS' as OrderStatus,
    delayRisk: 'gelb' as DelayRisk,
    updatedAt: daysAgo(3),
    reminderCount: 1,
    supplier: { id: 'sup-2', name: 'Stahlwerk Nord AG' },
  },
  {
    id: 'ord-3',
    orderNumber: 'PO-2024-115',
    partDescription: 'Schaltschrank IP65 800x600',
    quantity: 2,
    unit: 'Stück',
    dueDate: daysFromNow(5),
    status: 'SHIPPED' as OrderStatus,
    delayRisk: 'gruen' as DelayRisk,
    updatedAt: daysAgo(0),
    reminderCount: 0,
    supplier: { id: 'sup-3', name: 'Elektro Bauer & Co.' },
  },
  {
    id: 'ord-4',
    orderNumber: 'PO-2024-078',
    partDescription: 'Kugelgewindetrieb KGT 25',
    quantity: 4,
    unit: 'Stück',
    dueDate: daysAgo(5),
    status: 'PENDING' as OrderStatus,
    delayRisk: 'rot' as DelayRisk,
    updatedAt: daysAgo(7),
    reminderCount: 2,
    supplier: { id: 'sup-1', name: 'Hydraulik Müller GmbH' },
  },
  {
    id: 'ord-5',
    orderNumber: 'PO-2024-120',
    partDescription: 'Drehmomentstütze Typ A',
    quantity: 20,
    unit: 'Stück',
    dueDate: daysFromNow(14),
    status: 'RECEIVED' as OrderStatus,
    delayRisk: 'gruen' as DelayRisk,
    updatedAt: daysAgo(1),
    reminderCount: 0,
    supplier: { id: 'sup-2', name: 'Stahlwerk Nord AG' },
  },
];

export const DEMO_SCORECARD = {
  suppliers: [
    {
      id: 'sup-1',
      name: 'Hydraulik Müller GmbH',
      totalOrders: 4,
      onTimeRate: 0.5,
      avgResponseHours: 96,
      delayCount: 2,
      unresponsiveCount: 1,
      responsiveness: 'schlecht' as const,
    },
    {
      id: 'sup-2',
      name: 'Stahlwerk Nord AG',
      totalOrders: 5,
      onTimeRate: 0.8,
      avgResponseHours: 36,
      delayCount: 1,
      unresponsiveCount: 0,
      responsiveness: 'mittel' as const,
    },
    {
      id: 'sup-3',
      name: 'Elektro Bauer & Co.',
      totalOrders: 3,
      onTimeRate: 1.0,
      avgResponseHours: 12,
      delayCount: 0,
      unresponsiveCount: 0,
      responsiveness: 'gut' as const,
    },
  ],
};

export const DEMO_SUPPLIER_DETAIL = {
  name: 'Hydraulik Müller GmbH',
  metrics: {
    onTimeRate: 0.5,
    avgResponseHours: 96,
    delayCount: 2,
    unresponsiveCount: 1,
    responsiveness: 'schlecht' as const,
  },
  orders: DEMO_ORDERS.filter((o) => o.supplier.id === 'sup-1').map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    partDescription: o.partDescription,
    dueDate: o.dueDate,
    status: o.status,
    delayRisk: o.delayRisk,
  })),
};

export const DEMO_ORDER_DETAIL = {
  ...DEMO_ORDERS[0],
  statusNote: 'Materialverzug beim Zulieferer',
  magicToken: 'demo',
  events: [
    { id: 'ev-1', status: 'PENDING' as OrderStatus, note: null, source: 'manager', createdAt: daysAgo(14) },
    { id: 'ev-2', status: 'RECEIVED' as OrderStatus, note: null, source: 'supplier', createdAt: daysAgo(10) },
    { id: 'ev-3', status: 'DELAYED' as OrderStatus, note: 'Materialverzug beim Zulieferer', source: 'supplier', createdAt: daysAgo(1) },
  ],
};

export const DEMO_SUPPLIER_STATUS = {
  orderNumber: 'PO-2024-089',
  partDescription: 'Hydraulikzylinder 50mm',
  quantity: 10,
  unit: 'Stück',
  dueDate: daysAgo(2),
  currentStatus: 'DELAYED' as OrderStatus,
  supplierName: 'Klaus Müller',
  orgName: 'Muster Maschinenbau GmbH',
};
