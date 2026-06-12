import type { FastifyInstance } from 'fastify';
import { subDays, subMonths, startOfDay, startOfMonth, format } from 'date-fns';
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

    // Money tied up in orders that are overdue, reported delayed, or whose
    // confirmed date (AB-Abgleich) is later than the requested date.
    const valueAtRiskCents = activeOrders
      .filter(
        (o) =>
          o.dueDate < now ||
          o.status === 'DELAYED' ||
          (o.confirmedDate && o.confirmedDate > o.dueDate)
      )
      .reduce((sum, o) => sum + (o.valueCents ?? 0), 0);

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
      valueAtRiskCents,
    };
  });

  app.get('/dashboard/trends', async (request) => {
    const orgId = request.user.orgId;
    const monthStarts = Array.from({ length: 6 }, (_, i) =>
      startOfMonth(subMonths(new Date(), 5 - i))
    );

    const orders = await prisma.order.findMany({
      where: { orgId, createdAt: { gte: monthStarts[0] } },
      include: { events: true },
    });

    const months = monthStarts.map((monthStart, i) => {
      const monthEnd = i < 5 ? monthStarts[i + 1] : new Date();
      const dueInMonth = orders.filter((o) => o.dueDate >= monthStart && o.dueDate < monthEnd);
      const delivered = dueInMonth.filter((o) => o.status === 'DELIVERED');
      const onTime = delivered.filter((o) => !o.events.some((e) => e.status === 'DELAYED'));
      const delayed = dueInMonth.filter(
        (o) => o.status === 'DELAYED' || o.events.some((e) => e.status === 'DELAYED')
      );

      return {
        month: format(monthStart, 'yyyy-MM'),
        ordersDue: dueInMonth.length,
        delivered: delivered.length,
        onTimeRate: delivered.length > 0 ? onTime.length / delivered.length : null,
        delayed: delayed.length,
      };
    });

    return { months };
  });

  app.get('/dashboard/scorecard', async (request) => {
    const suppliers = await getScorecard(request.user.orgId);
    return { suppliers };
  });
}
