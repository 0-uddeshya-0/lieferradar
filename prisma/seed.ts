import { PrismaClient, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash('Test1234!', 12);

  const org = await prisma.organization.create({
    data: {
      name: 'Muster Maschinenbau GmbH',
      email: 'manager@muster.de',
      users: {
        create: {
          email: 'manager@muster.de',
          passwordHash,
          name: 'Hans Müller',
        },
      },
    },
  });

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Stahlwerk Müller GmbH',
        contactEmail: 'bestellung@stahlwerk-mueller.de',
        contactName: 'Klaus Müller',
      },
    }),
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Hydraulik Schmidt KG',
        contactEmail: 'auftrag@hydraulik-schmidt.de',
        contactName: 'Anna Schmidt',
      },
    }),
    prisma.supplier.create({
      data: {
        orgId: org.id,
        name: 'Elektrotechnik Weber',
        contactEmail: 'lieferung@elektro-weber.de',
        contactName: 'Peter Weber',
      },
    }),
  ]);

  const ordersData = [
    {
      supplierId: suppliers[0].id,
      orderNumber: 'PO-2024-001',
      partDescription: 'Stahlblech 3mm',
      quantity: 50,
      unit: 'Stück',
      dueDate: new Date('2026-07-15'),
      status: 'PENDING' as OrderStatus,
    },
    {
      supplierId: suppliers[1].id,
      orderNumber: 'PO-2024-002',
      partDescription: 'Hydraulikzylinder 50mm',
      quantity: 10,
      unit: 'Stück',
      dueDate: new Date('2026-06-20'),
      status: 'RECEIVED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-06-01'),
    },
    {
      supplierId: suppliers[1].id,
      orderNumber: 'PO-2024-003',
      partDescription: 'Hydraulikschlauch DN16',
      quantity: 20,
      unit: 'm',
      dueDate: new Date('2026-05-01'),
      status: 'DELAYED' as OrderStatus,
      statusNote: 'Materialengpass beim Hersteller',
      lastSupplierUpdate: new Date('2026-05-20'),
    },
    {
      supplierId: suppliers[2].id,
      orderNumber: 'PO-2024-004',
      partDescription: 'Steuerungsschrank IP54',
      quantity: 2,
      unit: 'Stück',
      dueDate: new Date('2026-06-25'),
      status: 'SHIPPED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-06-08'),
    },
    {
      supplierId: suppliers[0].id,
      orderNumber: 'PO-2024-005',
      partDescription: 'Schweißdraht ER70S-6',
      quantity: 100,
      unit: 'kg',
      dueDate: new Date('2026-05-15'),
      status: 'DELIVERED' as OrderStatus,
      lastSupplierUpdate: new Date('2026-05-14'),
    },
  ];

  for (const data of ordersData) {
    const order = await prisma.order.create({
      data: {
        orgId: org.id,
        ...data,
        events: {
          create: [{ status: 'PENDING', source: 'manager' }],
        },
      },
    });

    if (data.status !== 'PENDING') {
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          status: data.status,
          note: data.statusNote,
          source: data.status === 'DELIVERED' ? 'manager' : 'supplier',
        },
      });
    }
  }

  console.log('Seed completed: manager@muster.de / Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
