import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs"; // Import bcrypt directly

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai seed...");

  /* =========================
     CREATE ROLES
  ========================= */

  // Cek dulu apakah role sudah ada
  const existingRoles = await prisma.role.findMany();

  let superAdminRole, adminRole, managerRole, staffRole;

  if (existingRoles.length === 0) {
    // Jika belum ada role, buat dengan createMany
    const rolesData = [
      { name: "SUPER_ADMIN", description: "Akses penuh ke seluruh sistem" },
      { name: "ADMIN", description: "Administrator operasional" },
      { name: "MANAGER", description: "Pengelola operasional toko/kafe" },
      { name: "STAFF", description: "Staff dengan akses terbatas" },
    ];

    await prisma.role.createMany({
      data: rolesData,
    });

    // Ambil role yang baru dibuat
    const roles = await prisma.role.findMany();
    superAdminRole = roles.find((r) => r.name === "SUPER_ADMIN");
    adminRole = roles.find((r) => r.name === "ADMIN");
    managerRole = roles.find((r) => r.name === "MANAGER");
    staffRole = roles.find((r) => r.name === "STAFF");

    console.log("✅ Roles berhasil dibuat");
  } else {
    // Jika sudah ada, ambil dari database
    superAdminRole = existingRoles.find((r) => r.name === "SUPER_ADMIN");
    adminRole = existingRoles.find((r) => r.name === "ADMIN");
    managerRole = existingRoles.find((r) => r.name === "MANAGER");
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
    if (!managerRole) {
      managerRole = await prisma.role.create({
        data: { name: "MANAGER", description: "Pengelola operasional toko/kafe" },
      });
    }
    if (!staffRole) {
      staffRole = await prisma.role.create({
        data: { name: "STAFF", description: "Staff dengan akses terbatas" },
      });
    }
  }

  if (!superAdminRole || !adminRole || !managerRole || !staffRole) {
    throw new Error("Gagal mendapatkan role");
  }

  /* =========================
     CREATE USERS
  ========================= */

  // Hash passwords
  const passwordSuperAdmin = await bcrypt.hash("superasmin", 12);
  const passwordAdmin = await bcrypt.hash("admin", 12);
  const passwordManager = await bcrypt.hash("manager", 12);
  const passwordStaff = await bcrypt.hash("staff", 12); // user wrote 'pass staff'

  const usersData = [
    {
      nickname: "Super Admin",
      email: "superadmin@persija.id", // Updated to prevent confusing with example.com
      password: passwordSuperAdmin,
      status: "ACTIVE",
      type: "SYSTEM",
      point: 9999,
      roleId: superAdminRole.id,
    },
    {
      nickname: "Admin",
      email: "admin@persija.id",
      password: passwordAdmin,
      status: "ACTIVE",
      type: "SYSTEM",
      point: 1000,
      roleId: adminRole.id,
    },
    {
      nickname: "Manager",
      email: "manager@persija.id",
      password: passwordManager,
      status: "ACTIVE",
      type: "STAFF",
      point: 500,
      roleId: managerRole.id,
    },
    {
      nickname: "Staff",
      email: "staff@persija.id",
      password: passwordStaff,
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
          password: data.password, // Update password too
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
          password: data.password,
          status: data.status,
          type: data.type,
          point: data.point,
        },
      });
      console.log(`✅ User ${data.email} dibuat`);
    }

    // Assign Role
    const existingUserRole = await prisma.user_role_trx.findFirst({
      where: {
        user_id: user.id,
        role_id: data.roleId,
      },
    });

    if (!existingUserRole) {
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
