import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const CACHE_KEY = "cache:dashboard:stats";
const CACHE_TTL = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // 1. Check Redis Cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log("[DASHBOARD] Cache hit - Returning stats from Redis");
      return NextResponse.json({
        ...JSON.parse(cachedData),
        _source: "cache"
      });
    }

    console.log("[DASHBOARD] Cache miss - Querying database...");

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

    // 2. Store in Redis
    await redis.set(
      CACHE_KEY,
      JSON.stringify(dashboardData),
      "EX",
      CACHE_TTL
    );
    console.log("[DASHBOARD] Database results cached in Redis");

    return NextResponse.json({
      ...dashboardData,
      _source: "database"
    });
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
