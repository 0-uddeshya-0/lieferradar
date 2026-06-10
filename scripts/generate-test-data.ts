/**
 * Extended test data generator for manual QA.
 * Run: pnpm tsx scripts/generate-test-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('Run seed first: pnpm db:seed');
    process.exit(1);
  }

  const suppliers = await prisma.supplier.findMany({ where: { orgId: org.id } });
  if (suppliers.length === 0) {
    console.error('No suppliers found');
    process.exit(1);
  }

  const statuses = ['PENDING', 'RECEIVED', 'IN_PROGRESS', 'SHIPPED', 'DELAYED'] as const;

  for (let i = 0; i < 15; i++) {
    const supplier = suppliers[i % suppliers.length];
    const status = statuses[i % statuses.length];
    await prisma.order.create({
      data: {
        orgId: org.id,
        supplierId: supplier.id,
        orderNumber: `PO-TEST-${String(i + 1).padStart(3, '0')}`,
        partDescription: `Testteil ${i + 1}`,
        quantity: (i + 1) * 5,
        unit: 'Stück',
        dueDate: new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000),
        status,
        reminderCount: i % 4,
        events: {
          create: { status: 'PENDING', source: 'system' },
        },
      },
    });
  }

  console.log('Generated 15 additional test orders');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
