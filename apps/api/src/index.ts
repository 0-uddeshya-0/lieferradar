import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { registerCors } from './plugins/cors';
import { registerAuth } from './plugins/auth';
import { registerRateLimit } from './plugins/rateLimit';
import { authRoutes } from './routes/auth';
import { supplierRoutes } from './routes/suppliers';
import { orderRoutes } from './routes/orders';
import { supplierStatusRoutes } from './routes/supplier-status';
import { dashboardRoutes } from './routes/dashboard';
import { organizationRoutes } from './routes/organizations';
import { startReminderJob } from './jobs/reminderJob';
import { startDigestJob } from './jobs/digestJob';
import { config } from './config';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : 'info',
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
  });

  await registerCors(app);
  await registerAuth(app);
  await registerRateLimit(app);
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  await app.register(authRoutes);
  await app.register(supplierRoutes);
  await app.register(orderRoutes);
  await app.register(supplierStatusRoutes);
  await app.register(dashboardRoutes);
  await app.register(organizationRoutes);

  if (config.NODE_ENV !== 'test') {
    startReminderJob(app.log);
    startDigestJob(app.log);
  }

  return app;
}
