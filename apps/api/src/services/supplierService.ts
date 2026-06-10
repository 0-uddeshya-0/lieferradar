import { prisma } from '../db';
import type { CreateSupplierInput, UpdateSupplierInput } from '@lieferradar/shared';
import {
  computeOnTimeRate,
  computeAvgResponseHours,
  computeResponsivenessLabel,
  countUnresponsive,
} from '../utils/scorecard';
import { computeDelayRisk } from '../utils/delayRisk';

export async function createSupplier(orgId: string, input: CreateSupplierInput) {
  return prisma.supplier.create({
    data: { orgId, ...input },
  });
}

export async function getSuppliers(orgId: string) {
  return prisma.supplier.findMany({
    where: { orgId },
    orderBy: { name: 'asc' },
    include: {
      orders: {
        where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
      },
    },
  });
}

export async function getSupplierById(orgId: string, id: string) {
  const supplier = await prisma.supplier.findFirst({
    where: { id, orgId },
    include: {
      orders: {
        include: { events: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!supplier) return null;

  const allOrders = await prisma.order.findMany({
    where: { supplierId: id, orgId },
    include: { events: true },
  });

  const onTimeRate = computeOnTimeRate(allOrders);
  const avgResponseHours = computeAvgResponseHours(allOrders);
  const unresponsiveCount = countUnresponsive(allOrders);
  const responsiveness = computeResponsivenessLabel(avgResponseHours, unresponsiveCount);

  return {
    ...supplier,
    metrics: {
      onTimeRate,
      avgResponseHours,
      delayCount: allOrders.filter((o) => o.status === 'DELAYED').length,
      unresponsiveCount,
      responsiveness,
      totalOrders: allOrders.length,
    },
    orders: supplier.orders.map((o) => ({
      ...o,
      delayRisk: computeDelayRisk(o),
    })),
  };
}

export async function updateSupplier(orgId: string, id: string, input: UpdateSupplierInput) {
  const existing = await prisma.supplier.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error('Supplier not found');

  return prisma.supplier.update({
    where: { id },
    data: input,
  });
}

export async function deleteSupplier(orgId: string, id: string) {
  const existing = await prisma.supplier.findFirst({ where: { id, orgId } });
  if (!existing) throw new Error('Supplier not found');

  const activeOrders = await prisma.order.count({
    where: { supplierId: id, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
  });
  if (activeOrders > 0) {
    throw new Error('Cannot delete supplier with active orders');
  }

  return prisma.supplier.delete({ where: { id } });
}

export async function getScorecard(orgId: string) {
  const suppliers = await prisma.supplier.findMany({
    where: { orgId },
    include: {
      orders: { include: { events: true } },
    },
  });

  return suppliers.map((supplier) => {
    const orders = supplier.orders;
    const onTimeRate = computeOnTimeRate(orders);
    const avgResponseHours = computeAvgResponseHours(orders);
    const unresponsiveCount = countUnresponsive(orders);
    const responsiveness = computeResponsivenessLabel(avgResponseHours, unresponsiveCount);

    return {
      id: supplier.id,
      name: supplier.name,
      totalOrders: orders.length,
      onTimeRate,
      avgResponseHours: avgResponseHours ?? 0,
      delayCount: orders.filter((o) => o.status === 'DELAYED').length,
      unresponsiveCount,
      responsiveness,
    };
  });
}

export async function findOrCreateByEmail(
  orgId: string,
  email: string,
  name?: string
) {
  const existing = await prisma.supplier.findFirst({
    where: { orgId, contactEmail: email },
  });
  if (existing) return existing;

  return prisma.supplier.create({
    data: {
      orgId,
      contactEmail: email,
      name: name ?? email.split('@')[0],
    },
  });
}
