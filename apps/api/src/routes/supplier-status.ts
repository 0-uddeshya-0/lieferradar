import type { FastifyInstance } from 'fastify';
import { SupplierStatusUpdateSchema } from '@lieferradar/shared';
import { prisma } from '../db';
import { buildStatusUpdateAlert, sendEmail } from '../services/emailService';

export async function supplierStatusRoutes(app: FastifyInstance) {
  app.get('/s/:token', {
    config: { rateLimit: { max: 30, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };

    const order = await prisma.order.findUnique({
      where: { magicToken: token },
      include: { supplier: true, organization: true },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return reply.status(410).send({ error: 'Diese Bestellung ist bereits abgeschlossen' });
    }

    return {
      orderNumber: order.orderNumber,
      partDescription: order.partDescription,
      quantity: order.quantity ?? undefined,
      unit: order.unit ?? undefined,
      dueDate: order.dueDate.toISOString(),
      currentStatus: order.status,
      supplierName: order.supplier.name,
      orgName: order.organization.name,
    };
  });

  app.post('/s/:token', {
    config: { rateLimit: { max: 10, timeWindow: '1 hour', keyGenerator: (req) => (req.params as { token: string }).token } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = SupplierStatusUpdateSchema.parse(request.body);

    const order = await prisma.order.findUnique({
      where: { magicToken: token },
      include: { supplier: true, organization: true },
    });

    if (!order) {
      return reply.status(404).send({ error: 'Link ungültig oder abgelaufen' });
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return reply.status(410).send({ error: 'Diese Bestellung ist bereits abgeschlossen' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: body.status,
        statusNote: body.note,
        lastSupplierUpdate: new Date(),
        events: {
          create: {
            status: body.status,
            note: body.note,
            source: 'supplier',
          },
        },
      },
      include: { supplier: true, organization: true },
    });

    const email = buildStatusUpdateAlert(updated, body.status, body.note);
    await sendEmail(email);

    request.log.info({ orderId: order.id, orgId: order.orgId }, 'Supplier status updated');

    return { success: true };
  });
}
