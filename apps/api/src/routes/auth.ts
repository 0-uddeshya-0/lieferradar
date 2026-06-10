import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { addDays } from 'date-fns';
import { RegisterSchema, LoginSchema } from '@lieferradar/shared';
import { prisma } from '../db';
import { config } from '../config';
import { requireAuth } from '../middleware/requireAuth';

const BCRYPT_ROUNDS = 12;

function setAuthCookies(
  reply: { setCookie: (name: string, value: string, options: object) => void },
  accessToken: string,
  refreshToken: string
) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: config.NODE_ENV === 'production',
    path: '/',
  };

  reply.setCookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  reply.setCookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: config.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60,
  });
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const body = RegisterSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.status(409).send({ error: 'E-Mail bereits registriert' });
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const org = await prisma.organization.create({
      data: {
        name: body.orgName,
        email: body.email,
        users: {
          create: {
            email: body.email,
            passwordHash,
            name: body.name,
          },
        },
      },
      include: { users: true },
    });

    const user = org.users[0];
    const accessToken = app.jwt.sign({
      userId: user.id,
      orgId: org.id,
      email: user.email,
    });

    const refreshToken = nanoid(64);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), config.REFRESH_TOKEN_EXPIRES_IN_DAYS),
      },
    });

    setAuthCookies(reply, accessToken, refreshToken);

    request.log.info({ orgId: org.id, action: 'register' }, 'User registered');

    return {
      user: { id: user.id, email: user.email, name: user.name },
      organization: { id: org.id, name: org.name },
    };
  });

  app.post('/auth/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { organization: true },
    });

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.status(401).send({ error: 'Ungültige Anmeldedaten' });
    }

    const accessToken = app.jwt.sign({
      userId: user.id,
      orgId: user.orgId,
      email: user.email,
    });

    const refreshToken = nanoid(64);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: addDays(new Date(), config.REFRESH_TOKEN_EXPIRES_IN_DAYS),
      },
    });

    setAuthCookies(reply, accessToken, refreshToken);

    request.log.info({ orgId: user.orgId, action: 'login' }, 'User logged in');

    return {
      user: { id: user.id, email: user.email, name: user.name },
      organization: { id: user.organization.id, name: user.organization.name },
    };
  });

  app.post('/auth/logout', async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    reply.clearCookie('accessToken', { path: '/' });
    reply.clearCookie('refreshToken', { path: '/' });

    return { success: true };
  });

  app.post('/auth/refresh', async (request, reply) => {
    const token = request.cookies.refreshToken;
    if (!token) {
      return reply.status(401).send({ error: 'Kein Refresh-Token' });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Refresh-Token ungültig' });
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newRefreshToken = nanoid(64);
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: addDays(new Date(), config.REFRESH_TOKEN_EXPIRES_IN_DAYS),
      },
    });

    const accessToken = app.jwt.sign({
      userId: stored.user.id,
      orgId: stored.user.orgId,
      email: stored.user.email,
    });

    setAuthCookies(reply, accessToken, newRefreshToken);

    return { success: true };
  });

  app.get('/auth/me', { preHandler: requireAuth }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      include: { organization: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: { id: user.id, email: user.email, name: user.name },
      organization: { id: user.organization.id, name: user.organization.name },
    };
  });
}
