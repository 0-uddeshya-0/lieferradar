import type { FastifyInstance } from 'fastify';
import { CreateSupplierSchema, UpdateSupplierSchema } from '@lieferradar/shared';
import { requireAuth } from '../middleware/requireAuth';
import * as supplierService from '../services/supplierService';

export async function supplierRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/suppliers', async (request) => {
    return supplierService.getSuppliers(request.user.orgId);
  });

  app.get('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const supplier = await supplierService.getSupplierById(request.user.orgId, id);
    if (!supplier) return reply.status(404).send({ error: 'Lieferant nicht gefunden' });
    return supplier;
  });

  app.post('/suppliers', async (request, reply) => {
    const body = CreateSupplierSchema.parse(request.body);
    const supplier = await supplierService.createSupplier(request.user.orgId, body);
    request.log.info({ orgId: request.user.orgId, supplierId: supplier.id }, 'Supplier created');
    return reply.status(201).send(supplier);
  });

  app.patch('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = UpdateSupplierSchema.parse(request.body);
    try {
      const supplier = await supplierService.updateSupplier(request.user.orgId, id, body);
      return supplier;
    } catch {
      return reply.status(404).send({ error: 'Lieferant nicht gefunden' });
    }
  });

  app.delete('/suppliers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await supplierService.deleteSupplier(request.user.orgId, id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Fehler';
      return reply.status(400).send({ error: message });
    }
  });
}
