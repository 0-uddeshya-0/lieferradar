import { describe, it, expect } from 'vitest';
import {
  buildInitialNotification,
  buildStatusUpdateAlert,
  buildReminder1,
  buildWeeklyDigest,
} from '../../src/services/emailService';
import type { Order, Supplier, Organization } from '@prisma/client';

const supplier: Supplier = {
  id: 's1',
  orgId: 'o1',
  name: 'Müller GmbH',
  contactEmail: 'kontakt@mueller.de',
  contactName: 'Klaus',
  notes: null,
  createdAt: new Date(),
};

const org: Organization = {
  id: 'o1',
  name: 'Muster GmbH',
  email: 'manager@muster.de',
  createdAt: new Date(),
};

const order: Order & { supplier: Supplier; organization: Organization } = {
  id: 'ord1',
  orgId: 'o1',
  supplierId: 's1',
  orderNumber: 'PO-001',
  partDescription: 'Hydraulikzylinder',
  quantity: 10,
  unit: 'Stück',
  dueDate: new Date('2026-07-15'),
  status: 'PENDING',
  statusNote: null,
  magicToken: 'abc123token',
  lastSupplierUpdate: null,
  lastReminderSent: null,
  reminderCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  supplier,
  organization: org,
};

describe('email templates', () => {
  it('buildInitialNotification includes order number and magic link', () => {
    const email = buildInitialNotification(order);
    expect(email.subject).toContain('PO-001');
    expect(email.subject).toContain('Muster GmbH');
    expect(email.html).toContain('abc123token');
    expect(email.html).toContain('Status aktualisieren');
    expect(email.to).toBe('kontakt@mueller.de');
  });

  it('buildStatusUpdateAlert includes status label', () => {
    const email = buildStatusUpdateAlert(order, 'SHIPPED', 'Unterwegs');
    expect(email.subject).toContain('PO-001');
    expect(email.html).toContain('Versendet');
    expect(email.html).toContain('Unterwegs');
  });

  it('buildReminder1 includes reminder text', () => {
    const email = buildReminder1(order);
    expect(email.subject).toContain('Erinnerung');
    expect(email.html).toContain('abc123token');
  });

  it('buildWeeklyDigest includes overview', () => {
    const email = buildWeeklyDigest(org, {
      totalActive: 10,
      overdue: 3,
      silentSuppliers: 2,
      criticalOrders: [],
      unresponsiveSuppliers: [],
      deliveredThisWeek: [],
    });
    expect(email.subject).toContain('Wochenbericht');
    expect(email.html).toContain('10 aktive Bestellungen');
    expect(email.html).toContain('3 überfällig');
  });
});
