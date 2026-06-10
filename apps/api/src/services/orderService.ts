import { prisma } from '../db';
import type { OrderStatus, Prisma } from '@prisma/client';
import type { CreateOrderInput } from '@lieferradar/shared';
import { computeDelayRisk } from '../utils/delayRisk';
import { buildInitialNotification, sendEmail } from './emailService';
import { dispatchWebhook, orderWebhookPayload } from './webhookService';
import { ReminderType } from '@prisma/client';

export async function createOrder(orgId: string, input: CreateOrderInput) {
  const supplier = await prisma.supplier.findFirst({
    where: { id: input.supplierId, orgId },
  });
  if (!supplier) throw new Error('Supplier not found');

  const order = await prisma.order.create({
    data: {
      orgId,
      supplierId: input.supplierId,
      orderNumber: input.orderNumber,
      partDescription: input.partDescription,
      quantity: input.quantity,
      unit: input.unit,
      dueDate: new Date(input.dueDate),
      events: {
        create: { status: 'PENDING', source: 'manager' },
      },
    },
    include: { supplier: true, organization: true },
  });

  const email = buildInitialNotification(order);
  await sendEmail(email);

  await prisma.reminder.create({
    data: {
      orderId: order.id,
      type: ReminderType.INITIAL,
      emailTo: order.supplier.contactEmail,
    },
  });

  return enrichOrder(order);
}

export async function getOrders(
  orgId: string,
  filters: {
    status?: OrderStatus;
    supplierId?: string;
    overdueOnly?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'dueDate' | 'updatedAt' | 'createdAt';
    sortDir?: 'asc' | 'desc';
  }
) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);
  const sortBy = filters.sortBy ?? 'dueDate';
  const sortDir = filters.sortDir ?? 'asc';

  const where: Prisma.OrderWhereInput = { orgId };

  if (filters.status) where.status = filters.status;
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.overdueOnly) {
    where.dueDate = { lt: new Date() };
    where.status = { notIn: ['DELIVERED', 'CANCELLED'] };
  }
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { partDescription: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { supplier: true },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(enrichOrder),
    total,
    page,
    pageSize,
  };
}

export async function getOrderById(orgId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: { id, orgId },
    include: {
      supplier: true,
      events: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!order) return null;
  return { ...enrichOrder(order), events: order.events };
}

export async function updateOrderStatus(
  orgId: string,
  id: string,
  status: OrderStatus,
  note?: string,
  source: 'manager' | 'system' = 'manager'
) {
  const order = await prisma.order.findFirst({ where: { id, orgId } });
  if (!order) throw new Error('Order not found');

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusNote: note ?? order.statusNote,
      events: {
        create: { status, note, source },
      },
    },
    include: { supplier: true },
  });

  void dispatchWebhook(orgId, 'order.status_changed', orderWebhookPayload(updated));

  return enrichOrder(updated);
}

export async function cancelOrder(orgId: string, id: string) {
  return updateOrderStatus(orgId, id, 'CANCELLED', undefined, 'manager');
}

function enrichOrder<T extends { status: OrderStatus; dueDate: Date; lastSupplierUpdate: Date | null; reminderCount: number }>(
  order: T
) {
  return {
    ...order,
    delayRisk: computeDelayRisk(order),
  };
}
