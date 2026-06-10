import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/index';
import type { FastifyInstance } from 'fastify';

describe('API key integration', () => {
  let app: FastifyInstance;
  let accessToken: string;
  const testEmail = `apikey-${Date.now()}@example.de`;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const registerRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        orgName: 'API Key Test GmbH',
        email: testEmail,
        password: 'Test1234!',
        name: 'API Tester',
      },
    });
    expect(registerRes.statusCode).toBe(200);
    accessToken = registerRes.cookies.find((c) => c.name === 'accessToken')?.value ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a key, authenticates API requests with it, lists and revokes it', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/settings/api-keys',
      cookies: { accessToken },
      payload: { name: 'ERP-Connector' },
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json();
    expect(created.key).toMatch(/^lr_[0-9a-f]{48}$/);

    const ordersRes = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: { authorization: `Bearer ${created.key}` },
    });
    expect(ordersRes.statusCode).toBe(200);
    expect(ordersRes.json()).toMatchObject({ orders: [], total: 0 });

    const listRes = await app.inject({
      method: 'GET',
      url: '/settings/api-keys',
      cookies: { accessToken },
    });
    expect(listRes.statusCode).toBe(200);
    const keys = listRes.json();
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toHaveProperty('keyHash');

    const revokeRes = await app.inject({
      method: 'DELETE',
      url: `/settings/api-keys/${created.id}`,
      cookies: { accessToken },
    });
    expect(revokeRes.statusCode).toBe(200);

    const afterRevoke = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: { authorization: `Bearer ${created.key}` },
    });
    expect(afterRevoke.statusCode).toBe(401);
  });

  it('rejects invalid API keys', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: { authorization: 'Bearer lr_0000000000000000000000000000000000000000000000ff' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('configures a webhook and returns the secret once', async () => {
    const putRes = await app.inject({
      method: 'PUT',
      url: '/settings/webhook',
      cookies: { accessToken },
      payload: { url: 'https://example.com/hooks/lieferradar' },
    });
    expect(putRes.statusCode).toBe(200);
    expect(putRes.json().secret).toMatch(/^whsec_/);

    const getRes = await app.inject({
      method: 'GET',
      url: '/settings/webhook',
      cookies: { accessToken },
    });
    expect(getRes.json()).toEqual({ url: 'https://example.com/hooks/lieferradar' });

    const httpRes = await app.inject({
      method: 'PUT',
      url: '/settings/webhook',
      cookies: { accessToken },
      payload: { url: 'http://insecure.example.com/hook' },
    });
    expect(httpRes.statusCode).toBeGreaterThanOrEqual(400);
  });
});
