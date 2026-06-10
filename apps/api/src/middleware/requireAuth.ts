import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../plugins/auth';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token =
      request.cookies.accessToken ??
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.slice(7)
        : undefined);

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
