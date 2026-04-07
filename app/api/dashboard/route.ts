import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { getOrders } from "@/lib/order-api";

export const dynamic = "force-dynamic";

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

    console.log("[DASHBOARD] Cache miss - Querying data sources...");

    const [
      totalProducts,
      ordersData
    ] = await Promise.all([
      prisma.product.count(),
      getOrders()
    ]);

    const rows = ordersData?.rows || [];
    const totalOrders = ordersData?.total || rows.length;

    // 1. Calculate Summary Stats
    const totalRevenue = rows.reduce((sum: number, order: any) => {
      const amount = order.total_amount || order.amount || 0;
      return sum + amount;
    }, 0);

    // 2. Data Aggregation for Charts
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyStats: Record<string, { revenue: number, orders: number }> = {};
    const categoryCount: Record<string, number> = {};
    const variantCount: Record<string, number> = {};
    const productStats: Record<string, {
      name: string,
      category: string,
      price: number,
      image: string,
      orders: number,
      id: number
    }> = {};

    // Recent Orders logic - Indonesian Timezone (UTC+7)
    const now = new Date();
    const jakartaTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const todayISO = jakartaTime; // "YYYY-MM-DD"

    console.log(`[DASHBOARD] Date Today (Jakarta): ${todayISO}`);
    console.log(`[DASHBOARD] Total rows fetched: ${rows.length}`);

    const rowsForToday = rows.filter((order: any) => {
      const dateVal = order.created || order.created_at;
      if (!dateVal) return false;

      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;

      const orderISO = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);

      return orderISO === todayISO;
    });

    // Take top 5 latest from today (Orders Summary)
    const recentOrdersToday = rowsForToday
      .sort((a: any, b: any) => {
        const timeA = new Date(a.created || a.created_at || 0).getTime();
        const timeB = new Date(b.created || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5)
      .map((order: any) => ({
        id: order._id || order.id,
        order_number: order.order_number,
        amount: order.total_amount || order.amount || 0,
        status: order.status,
        time: order.created || order.created_at,
        table: order.table?.[0]?.no_table || "General"
      }));

    // Take top 5 latest items from today (Detailed Table)
    const recentItems: any[] = [];
    rowsForToday
      .sort((a: any, b: any) => {
        const timeA = new Date(a.created || a.created_at || 0).getTime();
        const timeB = new Date(b.created || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .forEach((order: any) => {
        const products = Array.isArray(order.products) ? order.products : [];
        products.forEach((p: any) => {
          if (recentItems.length < 5) {
            const name = p.name || "Unknown Menu";
            const catName = p.categories?.[0]?.name || p.category || "General";
            const variant = p.variants?.[0];

            recentItems.push({
              order_id: order.order_number.split('-').pop() || order.order_number.slice(-6).toUpperCase(),
              full_order_id: order.order_number,
              name: name,
              category: catName,
              qty: variant?.quantity || p.quantity || 1,
              amount: variant?.total_price || (p.price * (p.quantity || 1)) || (order.total_amount || order.amount || 0),
              status: p.status || order.status || "ORDERED",
              variant: variant?.name || p.desc || "",
              initials: name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        });
      });

    rows.forEach((order: any) => {
      const dateVal = order.created || order.created_at;
      const date = new Date(dateVal || new Date());
      const monthName = months[date.getMonth()];

      if (!monthlyStats[monthName]) {
        monthlyStats[monthName] = { revenue: 0, orders: 0 };
      }

      const amount = order.total_amount || order.amount || 0;
      monthlyStats[monthName].revenue += amount;
      monthlyStats[monthName].orders += 1;

      // Extract categories/products/variants
      const products = Array.isArray(order.products) ? order.products : [];
      products.forEach((p: any) => {
        const catName = p.categories?.[0]?.name || p.category || p.name || "General";
        categoryCount[catName] = (categoryCount[catName] || 0) + (p.quantity || 1);

        // Track products for Trending Menus
        const pId = p.id || p._id || p.name;
        if (!productStats[pId]) {
          productStats[pId] = {
            id: p.id,
            name: p.name,
            category: catName,
            price: p.variants?.[0]?.price || p.price || 0,
            image: p.variants?.[0]?.image || p.image || "",
            orders: 0
          };
        }
        productStats[pId].orders += (p.quantity || 1);

        // Track variants
        const variants = Array.isArray(p.variants) ? p.variants : [];
        variants.forEach((v: any) => {
          const vName = v.name || "Standard";
          variantCount[vName] = (variantCount[vName] || 0) + (v.quantity || 1);
        });
      });
    });

    // Generate last 6 months data for charts
    const chartRevenue = [];
    const chartOrders = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const stats = monthlyStats[mName] || { revenue: 0, orders: 0 };

      chartRevenue.push({
        month: mName,
        desktop: stats.revenue,
        mobile: stats.revenue * 0.4, // Split for visual variation
      });

      chartOrders.push({
        month: mName,
        desktop: stats.orders,
      });
    }

    // Top 5 Categories
    const chartCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        browser: name.toLowerCase().replace(/\s+/g, "_"),
        label: name,
        visitors: count,
        fill: `var(--chart-${index + 1})`
      }));

    // Top 5 Variants
    const chartVariants = Object.entries(variantCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], index) => ({
        browser: name.toLowerCase().replace(/\s+/g, "_"),
        visitors: count,
        fill: `var(--chart-${index + 1})`
      }));

    // Trending Menus (Top 3 Products)
    const gradients = [
      "from-orange-100 to-orange-200",
      "from-yellow-100 to-yellow-200",
      "from-emerald-100 to-emerald-200"
    ];

    const trendingMenus = Object.values(productStats)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3)
      .map((p, i) => ({
        name: p.name,
        type: p.category,
        price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.price),
        orders: p.orders.toString(),
        image: p.image,
        color: gradients[i] || gradients[0]
      }));

    const dashboardData = {
      orders: {
        total: totalOrders,
        revenue: totalRevenue,
        trending: 5.2,
      },
      products: {
        total: totalProducts,
        trending: 2.1,
      },
      recentOrdersToday: recentOrdersToday,
      recentItems: recentItems,
      trendingMenus: trendingMenus,
      charts: {
        revenue: chartRevenue,
        orders: chartOrders,
        categories: chartCategories,
        variants: chartVariants,
      }
    };

    // 3. Store in Redis
    await redis.set(
      CACHE_KEY,
      JSON.stringify(dashboardData),
      "EX",
      CACHE_TTL
    );
    console.log("[DASHBOARD] Aggregated results cached in Redis");

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
