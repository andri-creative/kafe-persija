import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const CACHE_KEY = "dashboard:v2:stats:this_week";
const CACHE_TTL = 300; // 5 Menit

export async function GET(request: NextRequest) {
    try {
        // 1. Time Range (Strict "This Week" - Starts Monday)
        const now = new Date();
        const currentDay = now.getDay(); 
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; 
        
        const mondayStart = new Date(now);
        mondayStart.setDate(now.getDate() + diffToMonday);
        mondayStart.setHours(0, 0, 0, 0);

        const sevenDaysAfterMonday = new Date(mondayStart);
        sevenDaysAfterMonday.setDate(sevenDaysAfterMonday.getDate() + 7);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(todayStart);

        // 2. Redis Cache Check (Safe Mode)
        let cachedData = null;
        try {
            cachedData = await redis.get(CACHE_KEY);
        } catch (e) {
            console.warn("Redis is down, fetching from DB...");
        }

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData));
        }

        // 3. Database Retrieval (Strict filter for current week and comparisons)
        const [
            revenueTotal, 
            orderCount, 
            activePromos, 
            transactions,
            todayRevenue,
            yesterdayRevenue,
            todayOrders,
            yesterdayOrders
        ] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { total: true },
                where: { status: "completed", created_at: { gte: mondayStart } }
            }),
            prisma.transaction.count({
                where: { status: "completed", created_at: { gte: mondayStart } }
            }),
            prisma.promo.count({
                where: { status: "active", start_date: { lte: now }, end_date: { gte: now } }
            }),
            prisma.transaction.findMany({
                where: { status: "completed", created_at: { gte: mondayStart } },
                include: {
                    transaction_item: {
                        include: {
                            product: {
                                include: {
                                    product_category_trx: { include: { product_category: true } }
                                }
                            }
                        }
                    },
                    user: { select: { nickname: true } }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.transaction.aggregate({
                _sum: { total: true },
                where: { status: "completed", created_at: { gte: todayStart } }
            }),
            prisma.transaction.aggregate({
                _sum: { total: true },
                where: { status: "completed", created_at: { gte: yesterdayStart, lt: yesterdayEnd } }
            }),
            prisma.transaction.count({
                where: { status: "completed", created_at: { gte: todayStart } }
            }),
            prisma.transaction.count({
                where: { status: "completed", created_at: { gte: yesterdayStart, lt: yesterdayEnd } }
            })
        ]);

        // 4. Processing Analytics
        const categorySales: Record<string, number> = {};
        const productSales: Record<number, {name: string, price: number, qty: number, image: string | null}> = {};
        const dailyOrders: Record<string, number> = {};
        const dailyRevenue: Record<string, number> = {};
        const variantSales: Record<string, number> = {};
        const chartMap: Record<string, string> = {};
        const orderedDates: string[] = [];

        // 7 Days Map (Strictly Monday to Sunday)
        const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        for (let i = 0; i < 7; i++) {
            const d = new Date(mondayStart);
            d.setDate(mondayStart.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = dayNames[i];
            
            orderedDates.push(dateStr);
            dailyOrders[dateStr] = 0;
            dailyRevenue[dateStr] = 0;
            chartMap[dateStr] = dayName;
        }

        transactions.forEach((t: any) => {
            const dateStr = t.created_at.toISOString().split('T')[0];
            // Only count if it's within our Monday-Sunday window
            if (dailyOrders[dateStr] !== undefined) {
                dailyOrders[dateStr]++;
                dailyRevenue[dateStr] += t.total;
            }

            t.transaction_item.forEach((item: any) => {
                if (!productSales[item.product_id]) {
                    productSales[item.product_id] = { 
                        name: item.product?.name || "Product", 
                        price: item.price, 
                        qty: 0,
                        image: item.product?.image || null
                    };
                }
                productSales[item.product_id].qty += item.qty;

                const categories = item.product?.product_category_trx || [];
                categories.forEach((catTrx: any) => {
                    const catName = catTrx.product_category?.name || "Other";
                    categorySales[catName] = (categorySales[catName] || 0) + item.qty;
                });

                const variantName = `Variant ${item.variant_id}`;
                variantSales[variantName] = (variantSales[variantName] || 0) + item.qty;
            });
        });

        const calcTrend = (nowVal: number, oldVal: number) => {
            if (oldVal === 0) return nowVal > 0 ? 100 : 0;
            return Math.round(((nowVal - oldVal) / oldVal) * 100);
        };

        const revenueTrend = calcTrend(todayRevenue._sum.total || 0, yesterdayRevenue._sum.total || 0);
        const orderTrend = calcTrend(todayOrders, yesterdayOrders);

        const trending = Object.keys(productSales)
            .map(id => ({
                name: productSales[Number(id)].name,
                image: productSales[Number(id)].image,
                sales: productSales[Number(id)].qty,
                price: productSales[Number(id)].price,
                type: "Best Seller"
            }))
            .sort((a, b) => Number(b.sales) - Number(a.sales))
            .slice(0, 3);

        const stats = {
            revenue: revenueTotal._sum.total || 0,
            revenueTrend,
            orders: orderCount,
            orderTrend,
            activePromos: activePromos,
            trending: trending,
            charts: {
                revenue: orderedDates.map(date => ({ day: chartMap[date], currentWeek: dailyRevenue[date], lastWeek: 0 })),
                orders: orderedDates.map(date => ({ day: chartMap[date], currentWeek: dailyOrders[date], lastWeek: 0 })),
                categories: Object.keys(categorySales).map(name => ({ category: name, value: categorySales[name] })),
                variants: Object.keys(variantSales).map(name => ({ name, value: variantSales[name] })),
            },
            recentItems: transactions.slice(0, 6).map((t: any) => ({
                order_id: t.id,
                name: t.user?.nickname || "Customer",
                amount: t.total,
                status: t.status.toUpperCase(),
                initials: (t.user?.nickname || "C").substring(0, 1).toUpperCase()
            })),
            updatedAt: new Date().toISOString(),
            isCache: false
        };

        try {
            await redis.set(CACHE_KEY, JSON.stringify({...stats, isCache: true}), "EX", CACHE_TTL);
        } catch (e) {}

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard Stats V2 Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytical data" }, { status: 500 });
    }
}
