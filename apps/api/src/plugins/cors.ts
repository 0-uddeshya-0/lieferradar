import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { config } from '../config';

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: config.NODE_ENV === 'production' ? config.WEB_URL : true,
    credentials: true,
  });
}
