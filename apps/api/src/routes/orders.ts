import type { FastifyInstance } from 'fastify';
import { parse } from 'csv-parse/sync';
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  CsvImportRowSchema,
} from '@lieferradar/shared';
import type { OrderStatus } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth';
import * as orderService from '../services/orderService';
import * as supplierService from '../services/supplierService';
import { sendManualReminder } from '../services/reminderService';

const MAX_CSV_SIZE = 5 * 1024 * 1024;

export async function orderRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/orders', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    return orderService.getOrders(request.user.orgId, {
      status: query.status as OrderStatus | undefined,
      supplierId: query.supplierId,
      overdueOnly: query.overdueOnly === 'true',
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      sortBy: query.sortBy as 'dueDate' | 'updatedAt' | 'createdAt' | undefined,
      sortDir: query.sortDir as 'asc' | 'desc' | undefined,
    });
  });

  app.post('/orders', async (request, reply) => {
    const body = CreateOrderSchema.parse(request.body);
    const order = await orderService.createOrder(request.user.orgId, body);
    request.log.info({ orgId: request.user.orgId, orderId: order.id }, 'Order created');
    return reply.status(201).send(order);
  });

  app.get('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = await orderService.getOrderById(request.user.orgId, id);
    if (!order) return reply.status(404).send({ error: 'Bestellung nicht gefunden' });
    return order;
  });

  app.patch('/orders/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateOrderStatusSchema.parse(request.body);
    try {
      const order = await orderService.updateOrderStatus(
        request.user.orgId,
        id,
        body.status as OrderStatus,
        body.note
      );
      return order;
    } catch {
      return reply.status(404).send({ error: 'Bestellung nicht gefunden' });
    }
  });

  app.delete('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const order = await orderService.cancelOrder(request.user.orgId, id);
      return order;
    } catch {
      return reply.status(404).send({ error: 'Bestellung nicht gefunden' });
    }
  });

  app.post('/orders/:id/remind', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await sendManualReminder(request.user.orgId, id);
      request.log.info({ orgId: request.user.orgId, orderId: id }, 'Manual reminder sent');
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fehler';
      return reply.status(400).send({ error: message });
    }
  });

  app.post('/orders/import', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Keine Datei hochgeladen' });
    }

    const buffer = await data.toBuffer();
    if (buffer.length > MAX_CSV_SIZE) {
      return reply.status(400).send({ error: 'Datei zu groß (max. 5 MB)' });
    }

    const mime = data.mimetype;
    if (!['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'].includes(mime)) {
      return reply.status(400).send({ error: 'Ungültiger Dateityp' });
    }

    const content = buffer.toString('utf-8');
    let rows: Record<string, string>[];
    try {
      rows = parse(content, { columns: true, skip_empty_lines: true, trim: true });
    } catch {
      return reply.status(400).send({ error: 'CSV konnte nicht gelesen werden' });
    }

    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const parsed = CsvImportRowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        errors.push({ row: rowNum, message: parsed.error.issues[0]?.message ?? 'Ungültige Zeile' });
        continue;
      }

      const row = parsed.data;
      try {
        const supplier = await supplierService.findOrCreateByEmail(
          request.user.orgId,
          row.supplierEmail
        );

        const dueDate = new Date(row.dueDate);
        if (isNaN(dueDate.getTime())) {
          errors.push({ row: rowNum, message: 'Ungültiges Datum' });
          continue;
        }

        await orderService.createOrder(request.user.orgId, {
          supplierId: supplier.id,
          orderNumber: row.orderNumber,
          partDescription: row.partDescription,
          quantity: row.quantity,
          unit: row.unit,
          dueDate: dueDate.toISOString(),
        });
        imported++;
      } catch (e) {
        errors.push({
          row: rowNum,
          message: e instanceof Error ? e.message : 'Importfehler',
        });
      }
    }

    request.log.info({ orgId: request.user.orgId, imported }, 'CSV import completed');
    return { imported, errors };
  });
}
