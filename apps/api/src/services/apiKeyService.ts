import { createHash, randomBytes } from 'crypto';
import { prisma } from '../db';

const KEY_PREFIX = 'lr_';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function isApiKey(token: string): boolean {
  return token.startsWith(KEY_PREFIX);
}

export async function createApiKey(orgId: string, name: string) {
  const plaintext = `${KEY_PREFIX}${randomBytes(24).toString('hex')}`;
  const record = await prisma.apiKey.create({
    data: { orgId, name, keyHash: hashKey(plaintext) },
  });
  // The plaintext key is shown exactly once; only the hash is stored.
  return { plaintext, record };
}

export async function verifyApiKey(token: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashKey(token) },
  });
  if (!apiKey) return null;

  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return apiKey;
}

export async function listApiKeys(orgId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
  });
  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
  }));
}

export async function revokeApiKey(orgId: string, id: string) {
  const existing = await prisma.apiKey.findFirst({ where: { id, orgId } });
  if (!existing) return false;
  await prisma.apiKey.delete({ where: { id } });
  return true;
}
