import { subDays } from 'date-fns';
import { prisma } from '../db';
import { ReminderType } from '@prisma/client';
import {
  buildReminder1,
  buildReminder2,
  buildUnresponsiveAlert,
  sendEmail,
} from './emailService';

const REMINDER_THRESHOLD_DAYS = 2;
const UNRESPONSIVE_ALERT_WINDOW_DAYS = 7;

export async function processReminders(): Promise<number> {
  const threshold = subDays(new Date(), REMINDER_THRESHOLD_DAYS);

  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ['DELIVERED', 'CANCELLED', 'SHIPPED'] },
      reminderCount: { lt: 3 },
      OR: [
        { lastSupplierUpdate: null },
        { lastSupplierUpdate: { lt: threshold } },
      ],
      AND: [
        {
          OR: [
            { lastReminderSent: null },
            { lastReminderSent: { lt: threshold } },
          ],
        },
      ],
    },
    include: { supplier: true, organization: true },
  });

  let processed = 0;

  for (const order of orders) {
    const reminderType =
      order.reminderCount === 0 || order.reminderCount === 1
        ? ReminderType.REMINDER_1
        : ReminderType.REMINDER_2;

    const email =
      reminderType === ReminderType.REMINDER_1
        ? buildReminder1(order)
        : buildReminder2(order);

    await sendEmail(email);

    const newCount = order.reminderCount + 1;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        reminderCount: newCount,
        lastReminderSent: new Date(),
      },
    });

    await prisma.reminder.create({
      data: {
        orderId: order.id,
        type: reminderType,
        emailTo: order.supplier.contactEmail,
      },
    });

    if (newCount >= 2 && !order.lastSupplierUpdate) {
      await sendUnresponsiveAlertIfNeeded(order.orgId, order.supplierId);
    }

    processed++;
  }

  return processed;
}

async function sendUnresponsiveAlertIfNeeded(orgId: string, supplierId: string) {
  const windowStart = subDays(new Date(), UNRESPONSIVE_ALERT_WINDOW_DAYS);

  const recentAlert = await prisma.reminder.findFirst({
    where: {
      order: { orgId, supplierId },
      type: ReminderType.REMINDER_2,
      sentAt: { gte: windowStart },
    },
  });
  if (recentAlert) return;

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      organization: true,
      orders: {
        where: {
          reminderCount: { gte: 2 },
          lastSupplierUpdate: null,
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
        },
      },
    },
  });

  if (!supplier || supplier.orders.length === 0) return;

  const email = buildUnresponsiveAlert(
    supplier.name,
    supplier.orders.length,
    supplier.organization.email
  );
  await sendEmail(email);
}

export async function sendManualReminder(orgId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, orgId },
    include: { supplier: true, organization: true },
  });
  if (!order) throw new Error('Order not found');
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new Error('Cannot remind for closed order');
  }

  const email = buildReminder1(order);
  await sendEmail(email);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      lastReminderSent: new Date(),
      reminderCount: { increment: 1 },
    },
  });

  await prisma.reminder.create({
    data: {
      orderId,
      type: ReminderType.MANUAL,
      emailTo: order.supplier.contactEmail,
    },
  });
}
