import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/index';
import { prisma } from '../../src/db';
import type { FastifyInstance } from 'fastify';

describe('Team invites integration', () => {
  let app: FastifyInstance;
  let accessToken: string;
  const ownerEmail = `team-owner-${Date.now()}@example.de`;
  const inviteeEmail = `team-invitee-${Date.now()}@example.de`;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const registerRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        orgName: 'Team Test GmbH',
        email: ownerEmail,
        password: 'Test1234!',
        name: 'Owner',
      },
    });
    expect(registerRes.statusCode).toBe(200);
    accessToken = registerRes.cookies.find((c) => c.name === 'accessToken')?.value ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  it('invites a colleague who can accept and log in to the same org', async () => {
    const inviteRes = await app.inject({
      method: 'POST',
      url: '/team/invites',
      cookies: { accessToken },
      payload: { email: inviteeEmail },
    });
    expect(inviteRes.statusCode).toBe(201);

    const invite = await prisma.invite.findFirst({ where: { email: inviteeEmail } });
    expect(invite).not.toBeNull();

    const infoRes = await app.inject({ method: 'GET', url: `/invites/${invite!.token}` });
    expect(infoRes.statusCode).toBe(200);
    expect(infoRes.json()).toMatchObject({ email: inviteeEmail, orgName: 'Team Test GmbH' });

    const acceptRes = await app.inject({
      method: 'POST',
      url: `/invites/${invite!.token}/accept`,
      payload: { name: 'Colleague', password: 'Test1234!' },
    });
    expect(acceptRes.statusCode).toBe(200);

    // Token is single-use.
    const reuse = await app.inject({ method: 'GET', url: `/invites/${invite!.token}` });
    expect(reuse.statusCode).toBe(404);

    const loginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: inviteeEmail, password: 'Test1234!' },
    });
    expect(loginRes.statusCode).toBe(200);

    const membersRes = await app.inject({
      method: 'GET',
      url: '/team/members',
      cookies: { accessToken },
    });
    expect(membersRes.statusCode).toBe(200);
    expect(membersRes.json().members).toHaveLength(2);
  });
});
