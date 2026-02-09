import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today";

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default: // today
        startDate.setHours(0, 0, 0, 0);
    }

    // Fetch statistics
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      inactiveProducts,
      totalVariants,
      totalCategories,
      totalUsers,
      totalTransactions,
      totalRevenue,
      recentProducts,
      recentTransactions,
      topProducts,
    ] = await Promise.all([
      // Total Products
      prisma.product.count(),

      // Active Products
      prisma.product.count({ where: { status: "active" } }),

      // Draft Products
      prisma.product.count({ where: { status: "draft" } }),

      // Inactive Products
      prisma.product.count({ where: { status: "inactive" } }),

      // Total Variants
      prisma.product_variants.count(),

      // Total Categories
      prisma.product_category.count(),

      // Total Users
      prisma.user.count(),

      // Total Transactions
      prisma.transaction.count({
        where: {
          created_at: { gte: startDate },
        },
      }),

      // Total Revenue (sum of transaction totals)
      prisma.transaction.aggregate({
        where: {
          created_at: { gte: startDate },
          status: "completed",
        },
        _sum: { total: true },
      }),

      // Recent Products (5 latest)
      prisma.product.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
        },
      }),

      // Recent Transactions (5 latest)
      prisma.transaction.findMany({
        take: 5,
        where: { created_at: { gte: startDate } },
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { nickname: true },
          },
        },
      }),

      // Top Products (based on transaction items)
      prisma.product.findMany({
        take: 5,
        orderBy: {
          transaction_item: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { transaction_item: true },
          },
        },
      }),
    ]);

    // Format data
    const formattedData = {
      totalProducts,
      activeProducts,
      draftProducts,
      inactiveProducts,
      totalVariants,
      totalCategories,
      totalUsers,
      totalTransactions,
      totalRevenue: totalRevenue._sum.total || 0,
      recentProducts,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        user_name: tx.user.nickname,
        total: tx.total,
        status: tx.status,
        created_at: tx.created_at,
      })),
      topProducts: topProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sales: p._count.transaction_item,
        revenue: p._count.transaction_item * 10000,
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
