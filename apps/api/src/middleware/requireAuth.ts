import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../plugins/auth';
import { isApiKey, verifyApiKey } from '../services/apiKeyService';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const bearer = request.headers.authorization?.startsWith('Bearer ')
      ? request.headers.authorization.slice(7)
      : undefined;

    if (bearer && isApiKey(bearer)) {
      const apiKey = await verifyApiKey(bearer);
      if (!apiKey) {
        return reply.status(401).send({ error: 'Ungültiger API-Schlüssel' });
      }
      request.user = {
        userId: `apikey:${apiKey.id}`,
        orgId: apiKey.orgId,
        email: 'api-key',
      };
      return;
    }

    const token = request.cookies.accessToken ?? bearer;

    if (!token) {
      return reply.status(401).send({ error: 'Nicht authentifiziert' });
    }

    const payload = request.server.jwt.verify<JwtPayload>(token);
    request.user = payload;
  } catch {
    return reply.status(401).send({ error: 'Sitzung abgelaufen' });
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload;
  }
}
