import {
  DEMO_ORDERS,
  DEMO_SUPPLIERS,
  type DemoOrder,
  type DemoSupplier,
} from './mockData';
import type { OrderStatus, DelayRisk, CreateOrderInput, CreateSupplierInput } from '../types';
import type { OrderFilters } from '../hooks/useFilters';

// Session-local state: starts from the seed data and mutates in memory so the
// demo behaves like a real app until the page is reloaded.
let orders: DemoOrder[] = DEMO_ORDERS.map((o) => ({ ...o, events: [...o.events] }));
let suppliers: DemoSupplier[] = [...DEMO_SUPPLIERS];
let manualReminders = 0;
let idCounter = 0;

const BASE_AUTOMATED_REMINDERS = 23;
const CLOSED: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-demo-${idCounter}`;
}

function computeRisk(order: Pick<DemoOrder, 'status' | 'dueDate' | 'reminderCount'>): DelayRisk {
  if (CLOSED.includes(order.status)) return 'gruen';
  if (order.status === 'DELAYED') return 'rot';
  const daysUntilDue = (new Date(order.dueDate).getTime() - Date.now()) / 86_400_000;
  if (daysUntilDue < 0) return 'rot';
  if (daysUntilDue <= 7 || order.reminderCount >= 2) return 'gelb';
  return 'gruen';
}

export function listOrders(filters?: OrderFilters): DemoOrder[] {
  let result = [...orders];
  if (filters?.status) result = result.filter((o) => o.status === filters.status);
  if (filters?.supplierId) result = result.filter((o) => o.supplier.id === filters.supplierId);
  if (filters?.overdueOnly) {
    result = result.filter(
      (o) => new Date(o.dueDate) < new Date() && !CLOSED.includes(o.status)
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.partDescription.toLowerCase().includes(q)
    );
  }
  return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function getOrder(id: string): DemoOrder | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(input: CreateOrderInput): DemoOrder {
  const supplier = suppliers.find((s) => s.id === input.supplierId);
  const order: DemoOrder = {
    id: nextId('ord'),
    orderNumber: input.orderNumber,
    partDescription: input.partDescription,
    quantity: input.quantity,
    unit: input.unit,
    dueDate: input.dueDate,
    status: 'PENDING',
    delayRisk: 'gruen',
    updatedAt: new Date().toISOString(),
    reminderCount: 0,
    statusNote: null,
    magicToken: nextId('token'),
    supplier: supplier
      ? { id: supplier.id, name: supplier.name }
      : { id: input.supplierId, name: 'Unbekannt' },
    events: [
      {
        id: nextId('ev'),
        status: 'PENDING',
        note: null,
        source: 'manager',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  order.delayRisk = computeRisk(order);
  orders = [order, ...orders];
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string): DemoOrder | undefined {
  const existing = orders.find((o) => o.id === id);
  if (!existing) return undefined;
  const updated: DemoOrder = {
    ...existing,
    status,
    statusNote: note ?? existing.statusNote,
    updatedAt: new Date().toISOString(),
    events: [
      ...existing.events,
      {
        id: nextId('ev'),
        status,
        note: note ?? null,
        source: 'manager',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  updated.delayRisk = computeRisk(updated);
  orders = orders.map((o) => (o.id === id ? updated : o));
  return updated;
}

export function remindOrder(id: string): void {
  orders = orders.map((o) =>
    o.id === id
      ? { ...o, reminderCount: o.reminderCount + 1, updatedAt: new Date().toISOString() }
      : o
  );
  manualReminders += 1;
}

export function listSuppliers(): DemoSupplier[] {
  return [...suppliers].sort((a, b) => a.name.localeCompare(b.name));
}

export function createSupplier(input: CreateSupplierInput): DemoSupplier {
  const supplier: DemoSupplier = {
    id: nextId('sup'),
    name: input.name,
    contactEmail: input.contactEmail,
    contactName: input.contactName,
  };
  suppliers = [...suppliers, supplier];
  return supplier;
}

function findOrCreateSupplierByEmail(email: string): DemoSupplier {
  const existing = suppliers.find((s) => s.contactEmail === email);
  if (existing) return existing;
  return createSupplier({ name: email.split('@')[0], contactEmail: email });
}

export function importCsv(text: string): { imported: number; errors: Array<{ row: number; message: string }> } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { imported: 0, errors: [{ row: 1, message: 'CSV ist leer' }] };

  const header = lines[0].split(',').map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const required = ['orderNumber', 'supplierEmail', 'partDescription', 'dueDate'];
  const missing = required.filter((name) => col(name) === -1);
  if (missing.length > 0) {
    return { imported: 0, errors: [{ row: 1, message: `Fehlende Spalten: ${missing.join(', ')}` }] };
  }

  const errors: Array<{ row: number; message: string }> = [];
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((c) => c.trim());
    const rowNum = i + 1;
    const orderNumber = cells[col('orderNumber')];
    const supplierEmail = cells[col('supplierEmail')];
    const partDescription = cells[col('partDescription')];
    const dueDateRaw = cells[col('dueDate')];

    if (!orderNumber || !supplierEmail || !partDescription || !dueDateRaw) {
      errors.push({ row: rowNum, message: 'Pflichtfelder fehlen' });
      continue;
    }
    const dueDate = new Date(dueDateRaw);
    if (isNaN(dueDate.getTime())) {
      errors.push({ row: rowNum, message: 'Ungültiges Datum' });
      continue;
    }

    const supplier = findOrCreateSupplierByEmail(supplierEmail);
    const quantityRaw = col('quantity') >= 0 ? cells[col('quantity')] : undefined;
    const quantity = quantityRaw ? Number(quantityRaw) : undefined;

    createOrder({
      supplierId: supplier.id,
      orderNumber,
      partDescription,
      quantity: quantity && Number.isFinite(quantity) ? quantity : undefined,
      unit: col('unit') >= 0 ? cells[col('unit')] || undefined : undefined,
      dueDate: dueDate.toISOString(),
    });
    imported += 1;
  }

  return { imported, errors };
}

export function getSummary() {
  const active = orders.filter((o) => !CLOSED.includes(o.status));
  const overdue = active.filter((o) => new Date(o.dueDate) < new Date());
  const delayed = active.filter((o) => o.status === 'DELAYED');
  const silent = new Set(
    active.filter((o) => o.reminderCount >= 2 && o.status === 'PENDING').map((o) => o.supplier.id)
  );
  const automated = BASE_AUTOMATED_REMINDERS + manualReminders;

  return {
    totalActiveOrders: active.length,
    overdueOrders: overdue.length,
    delayedOrders: delayed.length,
    silentSuppliers: silent.size,
    ordersUpdatedToday: 2,
    remindersAutomatedThisMonth: automated,
    supplierResponsesThisMonth: 8,
    estimatedCallsAvoided: automated,
  };
}

type Responsiveness = 'gut' | 'mittel' | 'schlecht';

const SEED_METRICS: Record<string, { onTimeRate: number; avgResponseHours: number; responsiveness: Responsiveness }> = {
  'sup-1': { onTimeRate: 0.5, avgResponseHours: 96, responsiveness: 'schlecht' },
  'sup-2': { onTimeRate: 0.8, avgResponseHours: 36, responsiveness: 'mittel' },
  'sup-3': { onTimeRate: 1.0, avgResponseHours: 12, responsiveness: 'gut' },
};

function supplierMetrics(supplierId: string) {
  const seed = SEED_METRICS[supplierId] ?? { onTimeRate: 1.0, avgResponseHours: 24, responsiveness: 'gut' as Responsiveness };
  const supplierOrders = orders.filter((o) => o.supplier.id === supplierId);
  return {
    ...seed,
    totalOrders: supplierOrders.length,
    delayCount: supplierOrders.filter((o) => o.status === 'DELAYED').length,
    unresponsiveCount: supplierOrders.filter((o) => o.reminderCount >= 2 && o.status === 'PENDING').length,
  };
}

export function getScorecard() {
  return {
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      ...supplierMetrics(s.id),
    })),
  };
}

export function getSupplierDetail(id: string) {
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) return undefined;
  return {
    name: supplier.name,
    metrics: supplierMetrics(id),
    orders: orders
      .filter((o) => o.supplier.id === id)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        partDescription: o.partDescription,
        dueDate: o.dueDate,
        status: o.status,
        delayRisk: o.delayRisk,
      })),
  };
}
