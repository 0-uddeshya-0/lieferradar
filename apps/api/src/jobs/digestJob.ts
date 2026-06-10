import cron from 'node-cron';
import { subDays } from 'date-fns';
import { prisma } from '../db';
import { config } from '../config';
import { buildWeeklyDigest, sendEmail, type DigestData } from '../services/emailService';
import { STATUS_LABELS } from '@lieferradar/shared';
import type { OrderStatus } from '@prisma/client';

export async function sendWeeklyDigests(): Promise<number> {
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const fiveDaysAgo = subDays(now, 5);

  const orgs = await prisma.organization.findMany({
    where: {
      orders: {
        some: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
      },
    },
    include: {
      orders: {
        include: { supplier: true },
      },
    },
  });

  let sent = 0;

  for (const org of orgs) {
    const activeOrders = org.orders.filter(
      (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    );

    const overdue = activeOrders.filter((o) => o.dueDate < now);
    const criticalOrders = activeOrders
      .filter((o) => o.dueDate < now || o.status === 'DELAYED')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .map((o) => ({
        orderNumber: o.orderNumber,
        supplierName: o.supplier.name,
        partDescription: o.partDescription,
        dueDate: o.dueDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }),
        status: STATUS_LABELS[o.status as OrderStatus] ?? o.status,
      }));

    const supplierCounts = new Map<string, { name: string; count: number }>();
    for (const o of activeOrders) {
      if (o.reminderCount >= 2 && (!o.lastSupplierUpdate || o.lastSupplierUpdate < fiveDaysAgo)) {
        const existing = supplierCounts.get(o.supplierId);
        if (existing) {
          existing.count++;
        } else {
          supplierCounts.set(o.supplierId, { name: o.supplier.name, count: 1 });
        }
      }
    }

    const deliveredThisWeek = org.orders
      .filter((o) => o.status === 'DELIVERED' && o.updatedAt >= weekAgo)
      .map((o) => ({
        orderNumber: o.orderNumber,
        supplierName: o.supplier.name,
        partDescription: o.partDescription,
      }));

    const digestData: DigestData = {
      totalActive: activeOrders.length,
      overdue: overdue.length,
      silentSuppliers: supplierCounts.size,
      criticalOrders,
      unresponsiveSuppliers: Array.from(supplierCounts.values()),
      deliveredThisWeek,
    };

    const email = buildWeeklyDigest(org, digestData);
    await sendEmail(email);
    sent++;
  }

  return sent;
}

export function startDigestJob(logger: { info: (obj: object, msg: string) => void }) {
  cron.schedule(config.DIGEST_CRON, async () => {
    try {
      const count = await sendWeeklyDigests();
      logger.info({ count }, 'Digest job completed');
    } catch (err) {
      logger.info({ err }, 'Digest job failed');
    }
  });
}
