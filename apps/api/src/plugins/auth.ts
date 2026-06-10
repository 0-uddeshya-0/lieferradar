import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  orgId: string;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(cookie, {
    secret: config.JWT_SECRET,
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
    cookie: {
      cookieName: 'accessToken',
      signed: false,
    },
  });
}
