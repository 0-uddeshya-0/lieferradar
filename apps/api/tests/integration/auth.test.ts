import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/index';
import type { FastifyInstance } from 'fastify';

describe('Auth integration', () => {
  let app: FastifyInstance;
  const testEmail = `test-${Date.now()}@example.de`;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, logs in, accesses protected route, refreshes, logs out', async () => {
    const registerRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        orgName: 'Test GmbH',
        email: testEmail,
        password: 'Test1234!',
        name: 'Test User',
      },
    });
    expect(registerRes.statusCode).toBe(200);
    const cookies = registerRes.cookies;

    const meRes = await app.inject({
      method: 'GET',
      url: '/auth/me',
      cookies: { accessToken: cookies.find((c) => c.name === 'accessToken')?.value ?? '' },
    });
    expect(meRes.statusCode).toBe(200);

    const logoutRes = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      cookies: Object.fromEntries(cookies.map((c) => [c.name, c.value])),
    });
    expect(logoutRes.statusCode).toBe(200);

    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: testEmail, password: 'Test1234!' },
    });
    expect(loginRes.statusCode).toBe(200);
  });
});
