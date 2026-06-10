import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/requireAuth';
import * as apiKeyService from '../services/apiKeyService';
import { generateWebhookSecret } from '../services/webhookService';

const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

const SetWebhookSchema = z.object({
  url: z.string().url().startsWith('https://', 'Webhook-URL muss HTTPS verwenden'),
});

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.post('/settings/api-keys', async (request, reply) => {
    const body = CreateApiKeySchema.parse(request.body);
    const { plaintext, record } = await apiKeyService.createApiKey(request.user.orgId, body.name);
    request.log.info({ orgId: request.user.orgId, apiKeyId: record.id }, 'API key created');
    return reply.status(201).send({
      id: record.id,
      name: record.name,
      key: plaintext,
      createdAt: record.createdAt,
    });
  });

  app.get('/settings/api-keys', async (request) => {
    return apiKeyService.listApiKeys(request.user.orgId);
  });

  app.delete('/settings/api-keys/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const revoked = await apiKeyService.revokeApiKey(request.user.orgId, id);
    if (!revoked) return reply.status(404).send({ error: 'API-Schlüssel nicht gefunden' });
    request.log.info({ orgId: request.user.orgId, apiKeyId: id }, 'API key revoked');
    return { success: true };
  });

  app.put('/settings/webhook', async (request) => {
    const body = SetWebhookSchema.parse(request.body);
    const secret = generateWebhookSecret();
    await prisma.organization.update({
      where: { id: request.user.orgId },
      data: { webhookUrl: body.url, webhookSecret: secret },
    });
    request.log.info({ orgId: request.user.orgId }, 'Webhook configured');
    // Secret is returned once so the consumer can verify signatures.
    return { url: body.url, secret };
  });

  app.get('/settings/webhook', async (request) => {
    const org = await prisma.organization.findUnique({
      where: { id: request.user.orgId },
      select: { webhookUrl: true },
    });
    return { url: org?.webhookUrl ?? null };
  });

  app.delete('/settings/webhook', async (request) => {
    await prisma.organization.update({
      where: { id: request.user.orgId },
      data: { webhookUrl: null, webhookSecret: null },
    });
    return { success: true };
  });
}
