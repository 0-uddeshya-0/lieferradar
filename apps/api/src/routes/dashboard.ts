import type { FastifyInstance } from 'fastify';
import { subDays, startOfDay } from 'date-fns';
import { prisma } from '../db';
import { ReminderType } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth';
import { getScorecard } from '../services/supplierService';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/dashboard/summary', async (request) => {
    const orgId = request.user.orgId;
    const now = new Date();
    const todayStart = startOfDay(now);
    const thirtyDaysAgo = subDays(now, 30);
    const fiveDaysAgo = subDays(now, 5);

    const activeOrders = await prisma.order.findMany({
      where: { orgId, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
      include: { supplier: true },
    });

    const overdueOrders = activeOrders.filter((o) => o.dueDate < now);
    const delayedOrders = activeOrders.filter((o) => o.status === 'DELAYED');

    const silentSupplierIds = new Set(
      activeOrders
        .filter(
          (o) =>
            o.reminderCount >= 2 &&
            (!o.lastSupplierUpdate || o.lastSupplierUpdate < fiveDaysAgo)
        )
        .map((o) => o.supplierId)
    );

    const ordersUpdatedToday = await prisma.order.count({
      where: {
        orgId,
        lastSupplierUpdate: { gte: todayStart },
      },
    });

    const remindersAutomatedThisMonth = await prisma.reminder.count({
      where: {
        order: { orgId },
        sentAt: { gte: thirtyDaysAgo },
        type: { in: [ReminderType.REMINDER_1, ReminderType.REMINDER_2, ReminderType.MANUAL] },
      },
    });

    const supplierResponsesThisMonth = await prisma.order.count({
      where: {
        orgId,
        lastSupplierUpdate: { gte: thirtyDaysAgo },
      },
    });

    return {
      totalActiveOrders: activeOrders.length,
      overdueOrders: overdueOrders.length,
      delayedOrders: delayedOrders.length,
      silentSuppliers: silentSupplierIds.size,
      ordersUpdatedToday,
      remindersAutomatedThisMonth,
      supplierResponsesThisMonth,
      estimatedCallsAvoided: remindersAutomatedThisMonth,
    };
  });

  app.get('/dashboard/scorecard', async (request) => {
    const suppliers = await getScorecard(request.user.orgId);
    return { suppliers };
  });
}
