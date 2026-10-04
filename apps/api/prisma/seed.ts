import { PrismaClient, StaffRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const password = 'Test@1234';

async function upsertStaff(email: string, name: string, role: StaffRole) {
  return prisma.staff.upsert({
    where: { email },
    update: { name, role, active: true, passwordHash: await bcrypt.hash(password, 10) },
    create: { email, name, role, passwordHash: await bcrypt.hash(password, 10) },
  });
}

async function main() {
  const [admin, kitchen, dispatch, driver] = await Promise.all([
    upsertStaff('admin@test.com', 'Test Admin', StaffRole.ADMIN),
    upsertStaff('kitchen@test.com', 'Test Kitchen', StaffRole.KITCHEN),
    upsertStaff('dispatch@test.com', 'Test Dispatch', StaffRole.DISPATCH),
    upsertStaff('driver@test.com', 'Test Driver', StaffRole.DRIVER),
  ]);

  await prisma.kitchenSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });

  const station = await prisma.kitchenStation.upsert({
    where: { name: 'Main Kitchen' },
    update: {},
    create: { name: 'Main Kitchen' },
  });
  const tier = await prisma.priceTier.upsert({
    where: { name: 'Standard' },
    update: { isDefault: true, derivationKind: 'MULTIPLY_COST', basisPoints: 20000 },
    create: { name: 'Standard', isDefault: true, derivationKind: 'MULTIPLY_COST', basisPoints: 20000 },
  });
  await prisma.priceTier.updateMany({ where: { id: { not: tier.id } }, data: { isDefault: false } });

  const company = await prisma.company.upsert({
    where: { id: 'demo-company' },
    update: { defaultDriverId: driver.id, priceTierId: tier.id },
    create: {
      id: 'demo-company',
      name: 'Demo Company',
      billingContactName: 'Demo Billing',
      billingContactEmail: 'billing@demo-company.com',
      billingContactPhone: '555-0100',
      priceTierId: tier.id,
      defaultDriverId: driver.id,
      domains: { create: { domain: 'demo-company.com' } },
      addresses: {
        create: { label: 'Main Office', line1: '100 Demo Street', city: 'New York', state: 'NY', zip: '10001' },
      },
    },
  });
  await prisma.employee.upsert({
    where: { companyId_email: { companyId: company.id, email: 'employee@demo-company.com' } },
    update: { name: 'Demo Employee', active: true },
    create: { companyId: company.id, email: 'employee@demo-company.com', name: 'Demo Employee' },
  });

  const dish = await prisma.dish.upsert({
    where: { sku: 'DEMO-001' },
    update: { active: true, kitchenStationId: station.id },
    create: {
      name: 'Demo Chicken Bowl',
      description: 'A seeded meal for local development.',
      sku: 'DEMO-001',
      temperature: 'HOT',
      costCents: 850,
      kitchenStationId: station.id,
    },
  });
  await prisma.dishPrice.upsert({
    where: { dishId_tierId: { dishId: dish.id, tierId: tier.id } },
    update: { amountCents: 1700 },
    create: { dishId: dish.id, tierId: tier.id, amountCents: 1700 },
  });
  const category = await prisma.menuCategory.upsert({
    where: { id: 'demo-category' },
    update: { active: true },
    create: { id: 'demo-category', name: 'Demo Menu', displayOrder: 0 },
  });
  await prisma.menuItem.upsert({
    where: { categoryId_dishId: { categoryId: category.id, dishId: dish.id } },
    update: { active: true, displayOrder: 0 },
    create: { categoryId: category.id, dishId: dish.id, displayOrder: 0 },
  });

  console.log(`Seeded staff accounts, demo company, and menu (admin=${admin.email}, kitchen=${kitchen.email}, dispatch=${dispatch.email})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
