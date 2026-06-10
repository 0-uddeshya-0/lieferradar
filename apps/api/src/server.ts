import { buildApp } from './index';
import { config } from './config';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    app.log.info(`API running on ${config.API_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
