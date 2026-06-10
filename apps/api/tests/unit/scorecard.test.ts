import { describe, it, expect } from 'vitest';
import {
  computeOnTimeRate,
  computeAvgResponseHours,
  computeResponsivenessLabel,
} from '../../src/utils/scorecard';
import type { Order, OrderEvent } from '@prisma/client';

function makeOrder(overrides: Partial<Order & { events: OrderEvent[] }> = {}) {
  return {
    id: '1',
    orgId: 'org',
    supplierId: 'sup',
    orderNumber: 'PO-1',
    partDescription: 'Test',
    quantity: 1,
    unit: 'Stück',
    dueDate: new Date('2026-06-01'),
    status: 'DELIVERED' as const,
    statusNote: null,
    magicToken: 'token',
    lastSupplierUpdate: new Date('2026-05-28'),
    lastReminderSent: null,
    reminderCount: 0,
    createdAt: new Date('2026-05-01'),
    updatedAt: new Date('2026-05-28'),
    events: [],
    ...overrides,
  };
}

describe('computeOnTimeRate', () => {
  it('returns 1.0 when no delivered orders', () => {
    expect(computeOnTimeRate([])).toBe(1.0);
  });

  it('returns 1.0 when all delivered on time', () => {
    const orders = [makeOrder({ events: [] })];
    expect(computeOnTimeRate(orders)).toBe(1.0);
  });

  it('returns 0.5 when half had DELAYED events', () => {
    const orders = [
      makeOrder({ events: [] }),
      makeOrder({
        id: '2',
        events: [{ id: 'e1', orderId: '2', status: 'DELAYED', note: null, source: 'supplier', createdAt: new Date() }],
      }),
    ];
    expect(computeOnTimeRate(orders)).toBe(0.5);
  });
});

describe('computeAvgResponseHours', () => {
  it('returns null when no responses', () => {
    expect(computeAvgResponseHours([makeOrder({ lastSupplierUpdate: null })])).toBeNull();
  });

  it('computes average hours', () => {
    const created = new Date('2026-05-01T00:00:00Z');
    const updated = new Date('2026-05-02T00:00:00Z');
    const orders = [makeOrder({ createdAt: created, lastSupplierUpdate: updated })];
    expect(computeAvgResponseHours(orders)).toBe(24);
  });
});

describe('computeResponsivenessLabel', () => {
  it('returns schlecht for high unresponsive count', () => {
    expect(computeResponsivenessLabel(10, 3)).toBe('schlecht');
  });

  it('returns schlecht for null avg hours', () => {
    expect(computeResponsivenessLabel(null, 0)).toBe('schlecht');
  });

  it('returns gut for fast response', () => {
    expect(computeResponsivenessLabel(12, 0)).toBe('gut');
  });

  it('returns mittel for moderate response', () => {
    expect(computeResponsivenessLabel(48, 0)).toBe('mittel');
  });
});
