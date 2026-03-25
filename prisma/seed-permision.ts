import prisma from '../lib/prisma';
import { SYSTEM_PERMISSIONS } from '../types/rbac';

async function main() {
  const permissionNames = Object.values(SYSTEM_PERMISSIONS);

  const data = permissionNames.map((name) => ({ name }));

  await prisma.permission.createMany({
    data,
    skipDuplicates: true,
  });

  console.log('✅ Seeded permissions successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
