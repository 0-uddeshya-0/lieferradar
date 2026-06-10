import { describe, it, expect } from 'vitest';
import { CreateOrderSchema, UpdateOrderStatusSchema, SupplierStatusUpdateSchema } from './order';
import { CreateSupplierSchema } from './supplier';
import { RegisterSchema, LoginSchema } from './auth';

describe('CreateOrderSchema', () => {
  it('accepts valid order input', () => {
    const result = CreateOrderSchema.safeParse({
      supplierId: 'clh7q8x9y0000qz8x9y0000qz8',
      orderNumber: 'PO-001',
      partDescription: 'Hydraulikzylinder',
      dueDate: '2024-12-15T00:00:00.000Z',
      quantity: 10,
      unit: 'Stück',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty order number', () => {
    const result = CreateOrderSchema.safeParse({
      supplierId: 'clh7q8x9y0000qz8x9y0000qz8',
      orderNumber: '',
      partDescription: 'Test',
      dueDate: '2024-12-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateOrderStatusSchema', () => {
  it('accepts valid status update', () => {
    const result = UpdateOrderStatusSchema.safeParse({ status: 'DELIVERED' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = UpdateOrderStatusSchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

describe('SupplierStatusUpdateSchema', () => {
  it('requires note for DELAYED status', () => {
    const result = SupplierStatusUpdateSchema.safeParse({ status: 'DELAYED' });
    expect(result.success).toBe(false);
  });

  it('accepts DELAYED with note', () => {
    const result = SupplierStatusUpdateSchema.safeParse({
      status: 'DELAYED',
      note: 'Materialengpass',
    });
    expect(result.success).toBe(true);
  });
});

describe('CreateSupplierSchema', () => {
  it('accepts valid supplier', () => {
    const result = CreateSupplierSchema.safeParse({
      name: 'Müller GmbH',
      contactEmail: 'kontakt@mueller.de',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = CreateSupplierSchema.safeParse({
      name: 'Test',
      contactEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('rejects short password', () => {
    const result = RegisterSchema.safeParse({
      orgName: 'Test GmbH',
      email: 'test@test.de',
      password: 'short',
      name: 'Max',
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('accepts valid login', () => {
    const result = LoginSchema.safeParse({
      email: 'test@test.de',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });
});
