import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { prisma } from '../db';
import { config } from '../config';
import { requireAuth } from '../middleware/requireAuth';
import { sendEmail } from '../services/emailService';

const INVITE_VALID_DAYS = 7;
const BCRYPT_ROUNDS = 12;

const CreateInviteSchema = z.object({
  email: z.string().email(),
});

const AcceptInviteSchema = z.object({
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
});

export async function teamRoutes(app: FastifyInstance) {
  app.get('/team/members', { preHandler: requireAuth }, async (request) => {
    const members = await prisma.user.findMany({
      where: { orgId: request.user.orgId },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const pendingInvites = await prisma.invite.findMany({
      where: { orgId: request.user.orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return { members, pendingInvites };
  });

  app.post('/team/invites', {
    preHandler: requireAuth,
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const body = CreateInviteSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      return reply.status(409).send({ error: 'E-Mail ist bereits registriert' });
    }

    const org = await prisma.organization.findUnique({ where: { id: request.user.orgId } });
    if (!org) return reply.status(404).send({ error: 'Organisation nicht gefunden' });

    const invite = await prisma.invite.create({
      data: {
        orgId: org.id,
        email: body.email,
        expiresAt: addDays(new Date(), INVITE_VALID_DAYS),
      },
    });

    const inviteUrl = `${config.WEB_URL}/invite/${invite.token}`;
    await sendEmail({
      to: body.email,
      subject: `Einladung zu LieferRadar – ${org.name}`,
      html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;">
<h2>Einladung zu LieferRadar</h2>
<p>${request.user.email} hat Sie eingeladen, dem Einkaufsteam von <strong>${org.name.replace(/</g, '&lt;')}</strong> beizutreten.</p>
<p style="text-align:center;margin:25px 0;">
<a href="${inviteUrl}" style="background:#364fc7;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Einladung annehmen</a>
</p>
<p style="font-size:12px;color:#666;">Der Link ist ${INVITE_VALID_DAYS} Tage gültig.</p>
</body></html>`,
    });

    request.log.info({ orgId: org.id, inviteId: invite.id }, 'Team invite sent');
    return reply.status(201).send({ id: invite.id, email: invite.email, expiresAt: invite.expiresAt });
  });

  app.delete('/team/invites/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const invite = await prisma.invite.findFirst({ where: { id, orgId: request.user.orgId } });
    if (!invite) return reply.status(404).send({ error: 'Einladung nicht gefunden' });
    await prisma.invite.delete({ where: { id } });
    return { success: true };
  });

  // Public: invite info for the accept page.
  app.get('/invites/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { organization: { select: { name: true } } },
    });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return reply.status(404).send({ error: 'Einladung ungültig oder abgelaufen' });
    }
    return { email: invite.email, orgName: invite.organization.name };
  });

  // Public: accept the invite and create the account.
  app.post('/invites/:token/accept', {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = AcceptInviteSchema.parse(request.body);

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return reply.status(404).send({ error: 'Einladung ungültig oder abgelaufen' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser) {
      return reply.status(409).send({ error: 'E-Mail ist bereits registriert' });
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invite.email,
          name: body.name,
          passwordHash,
          orgId: invite.orgId,
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    request.log.info({ orgId: invite.orgId, inviteId: invite.id }, 'Invite accepted');
    return { success: true };
  });
}
