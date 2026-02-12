import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      inactiveProducts,
      totalUsers,
      activeUsers,
      newTodayUsers,
      newThisWeekUsers,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "active" } }),
      prisma.product.count({ where: { status: "draft" } }),
      prisma.product.count({ where: { status: "inactive" } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: "active" } }),
      prisma.user.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: weekStart,
          },
        },
      }),
    ]);

    const dashboardData = {
      products: {
        total: totalProducts,
        active: activeProducts,
        draft: draftProducts,
        inactive: inactiveProducts,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newTodayUsers,
        newThisWeek: newThisWeekUsers,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
