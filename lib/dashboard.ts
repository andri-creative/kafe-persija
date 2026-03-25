import prisma from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // 1. Total Orders
      prisma.transaction.count({
        where: {
          status: "completed",
        },
      }),

      // 2. Total Revenue (harga total dari semua transaksi completed)
      prisma.transaction.aggregate({
        where: { status: "completed" },
        _sum: { total: true },
      }),

      // 3. Total Users
      prisma.user.count({
        where: { status: "active" },
      }),

      // 4. Total Products Aktif
      prisma.product.count({
        where: { status: "active" },
      }),

      // 5. Recent Orders (10 terbaru)
      prisma.transaction.findMany({
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { nickname: true, email: true },
          },
        },
      }),

      // 7. Revenue 7 hari terakhir
      getLast7DaysRevenue(),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      totalProducts,
      recentOrders,
      topProducts,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// Fungsi untuk revenue 7 hari terakhir
async function getLast7DaysRevenue() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyData = await prisma.transaction.groupBy({
    by: ["created_at"],
    _sum: { total: true },
    where: {
      created_at: { gte: sevenDaysAgo },
      status: "completed",
    },
    orderBy: { created_at: "asc" },
  });

  // Format data untuk chart
  return dailyData.map((item: any) => ({
    date: item.created_at.toISOString().split("T")[0],
    revenue: Number(item._sum.total || 0),
  }));
}

// Fungsi untuk mendapatkan statistik berdasarkan role
export async function getRoleBasedStats(role: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const stats = {
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  };

  // Untuk semua role
  stats.todayOrders = await prisma.transaction.count({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const todayRevenue = await prisma.transaction.aggregate({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: "completed",
    },
    _sum: { total: true },
  });
  stats.todayRevenue = Number(todayRevenue._sum.total || 0);

  // Hanya untuk admin/manajer
  if (["super_admin", "admin", "manager"].includes(role)) {
    stats.pendingOrders = await prisma.transaction.count({
      where: { status: "pending" },
    });
  }

  // Hanya untuk super_admin/admin
  if (["super_admin", "admin"].includes(role)) {
    // Contoh: produk dengan stok rendah (jika ada field stock)
    stats.lowStockProducts = 0; // Sesuaikan dengan schema
  }

  return stats;
}
