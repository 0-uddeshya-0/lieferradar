import { describe, it, expect } from 'vitest';
import { computeDelayRisk } from '../../src/utils/delayRisk';

const base = {
  dueDate: new Date('2026-12-31'),
  lastSupplierUpdate: null as Date | null,
  reminderCount: 0,
};

describe('computeDelayRisk', () => {
  it('returns gruen for DELIVERED', () => {
    expect(computeDelayRisk({ ...base, status: 'DELIVERED' })).toBe('gruen');
  });

  it('returns gruen for CANCELLED', () => {
    expect(computeDelayRisk({ ...base, status: 'CANCELLED' })).toBe('gruen');
  });

  it('returns rot for DELAYED status', () => {
    expect(computeDelayRisk({ ...base, status: 'DELAYED' })).toBe('rot');
  });

  it('returns rot when past due date', () => {
    expect(
      computeDelayRisk({
        ...base,
        status: 'PENDING',
        dueDate: new Date('2020-01-01'),
      })
    ).toBe('rot');
  });

  it('returns gelb when due within 3 days and no supplier update', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    expect(
      computeDelayRisk({
        ...base,
        status: 'PENDING',
        dueDate,
        lastSupplierUpdate: null,
      })
    ).toBe('gelb');
  });

  it('returns gelb when reminderCount >= 2 and no update', () => {
    expect(
      computeDelayRisk({
        ...base,
        status: 'PENDING',
        reminderCount: 2,
        lastSupplierUpdate: null,
      })
    ).toBe('gelb');
  });

  it('returns gelb when due within 7 days', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    expect(
      computeDelayRisk({
        ...base,
        status: 'RECEIVED',
        dueDate,
        lastSupplierUpdate: new Date(),
      })
    ).toBe('gelb');
  });

  it('returns gruen when far from due with update', () => {
    expect(
      computeDelayRisk({
        ...base,
        status: 'RECEIVED',
        dueDate: new Date('2026-12-31'),
        lastSupplierUpdate: new Date(),
      })
    ).toBe('gruen');
  });
});
