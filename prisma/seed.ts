import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai seed...");

  /* =========================
     CREATE ROLES
  ========================= */

  // Cek dulu apakah role sudah ada
  const existingRoles = await prisma.role.findMany();

  let superAdminRole, adminRole, staffRole;

  if (existingRoles.length === 0) {
    // Jika belum ada role, buat dengan createMany
    const rolesData = [
      { name: "SUPER_ADMIN", description: "Akses penuh ke seluruh sistem" },
      { name: "ADMIN", description: "Administrator operasional" },
      { name: "STAFF", description: "Staff dengan akses terbatas" },
    ];

    await prisma.role.createMany({
      data: rolesData,
    });

    // Ambil role yang baru dibuat
    const roles = await prisma.role.findMany();
    superAdminRole = roles.find((r) => r.name === "SUPER_ADMIN");
    adminRole = roles.find((r) => r.name === "ADMIN");
    staffRole = roles.find((r) => r.name === "STAFF");

    console.log("✅ Roles berhasil dibuat");
  } else {
    // Jika sudah ada, ambil dari database
    superAdminRole = existingRoles.find((r) => r.name === "SUPER_ADMIN");
    adminRole = existingRoles.find((r) => r.name === "ADMIN");
    staffRole = existingRoles.find((r) => r.name === "STAFF");

    // Jika ada yang belum ada, buat yang belum
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: "SUPER_ADMIN",
          description: "Akses penuh ke seluruh sistem",
        },
      });
    }
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: "ADMIN", description: "Administrator operasional" },
      });
    }
    if (!staffRole) {
      staffRole = await prisma.role.create({
        data: { name: "STAFF", description: "Staff dengan akses terbatas" },
      });
    }
  }

  if (!superAdminRole || !adminRole || !staffRole) {
    throw new Error("Gagal mendapatkan role");
  }

  /* =========================
     CREATE USERS
  ========================= */

  const usersData = [
    {
      nickname: "Super Admin",
      email: "superadmin@example.com",
      status: "ACTIVE",
      type: "SYSTEM",
      point: 9999,
      roleId: superAdminRole.id,
    },
    {
      nickname: "Admin",
      email: "admin@example.com",
      status: "ACTIVE",
      type: "SYSTEM",
      point: 1000,
      roleId: adminRole.id,
    },
    {
      nickname: "Staff",
      email: "staff@example.com",
      status: "ACTIVE",
      type: "STAFF",
      point: 300,
      roleId: staffRole.id,
    },
  ];

  for (const data of usersData) {
    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    let user;

    if (existingUser) {
      // Update jika sudah ada
      user = await prisma.user.update({
        where: { email: data.email },
        data: {
          nickname: data.nickname,
          status: data.status,
          type: data.type,
          point: data.point,
        },
      });
      console.log(`↻ User ${data.email} diperbarui`);
    } else {
      // Buat baru jika belum ada
      user = await prisma.user.create({
        data: {
          nickname: data.nickname,
          email: data.email,
          status: data.status,
          type: data.type,
          point: data.point,
        },
      });
      console.log(`✅ User ${data.email} dibuat`);
    }

    // PERBAIKAN DI SINI: gunakan snake_case 'user_role_trx' bukan camelCase
    const existingUserRole = await prisma.user_role_trx.findFirst({
      where: {
        user_id: user.id,
        role_id: data.roleId,
      },
    });

    if (!existingUserRole) {
      // PERBAIKAN DI SINI: juga gunakan snake_case
      await prisma.user_role_trx.create({
        data: {
          user_id: user.id,
          role_id: data.roleId,
        },
      });
      console.log(`   ↳ Role assigned`);
    }
  }

  console.log("🎉 SEED BERHASIL");
}

main()
  .catch((error) => {
    console.error("Error saat seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
