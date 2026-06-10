import type { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { requireAuth } from '../middleware/requireAuth';

export async function organizationRoutes(app: FastifyInstance) {
  app.delete('/organizations/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };

    if (id !== request.user.orgId) {
      return reply.status(403).send({ error: 'Keine Berechtigung' });
    }

    await prisma.organization.delete({ where: { id } });

    request.log.info({ orgId: id, action: 'delete_organization' }, 'Organization deleted');

    return { success: true };
  });
}
