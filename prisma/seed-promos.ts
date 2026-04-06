import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎟️ Seeding Promos...");

  const admin = await prisma.user.findFirst({ where: { email: "admin@persija.id" } });
  if (!admin) {
    console.error("❌ Admin user not found. Please run RBAC seed first.");
    return;
  }

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const promos = [
    {
      code_promo: "PERSIJADAY",
      title: "Promo Persija Day",
      desc: "Diskon 20% khusus hari tanding Persija!",
      type: "percentage",
      value: 20,
      status: "active",
      start_date: now,
      end_date: nextMonth,
      created_by: admin.id,
      updated_by: admin.id
    },
    {
      code_promo: "KAFEHEBOH",
      title: "Voucher Opening",
      desc: "Potongan Rp 10.000 untuk pelanggan baru",
      type: "fixed",
      value: 10000,
      status: "active",
      start_date: now,
      end_date: nextMonth,
      created_by: admin.id,
      updated_by: admin.id
    },
    {
        code_promo: "MANTAF",
        title: "Voucher Mantaf",
        desc: "Potongan Rp 5.000 saja",
        type: "fixed",
        value: 5000,
        status: "active",
        start_date: now,
        end_date: nextMonth,
        created_by: admin.id,
        updated_by: admin.id
      }
  ];

  for (const p of promos) {
    await prisma.promo.upsert({
      where: { code_promo: p.code_promo },
      update: p,
      create: p,
    });
  }

  console.log("🏷️ Seeding Discounts...");
  const discounts = [
    {
      name: "Discount Member",
      description: "Diskon 10% untuk pemegang kartu member",
      type: "percentage",
      value: 10,
      is_active: true,
      created_by: admin.id,
      updated_by: admin.id
    },
    {
      name: "Happy Hour",
      description: "Potongan Rp 15.000 setiap jam 14.00 - 16.00",
      type: "fixed",
      value: 15000,
      is_active: true,
      created_by: admin.id,
      updated_by: admin.id
    }
  ];

  for (const d of discounts) {
    await prisma.discount.create({
      data: d
    });
  }

  console.log("✅ Seeded promos & discounts successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
