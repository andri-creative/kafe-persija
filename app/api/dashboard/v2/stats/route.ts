import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";
import redis from "@/lib/redis";
import prisma from "@/lib/prisma";

const BACKEND_URL = 'https://api.dev.accolaplay.id/v2/kafe/dashboard/orders';
const CACHE_KEY = "dashboard:v2:stats:this_week";
const CACHE_TTL = 60; 

export async function GET(request: NextRequest) {
    try {
        // 1. Time Range (Monday to Sunday)
        const now = new Date();
        const currentDay = now.getDay(); 
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; 
        
        const mondayStart = new Date(now);
        mondayStart.setDate(now.getDate() + diffToMonday);
        mondayStart.setHours(0, 0, 0, 0);

        // 2. Redis Cache Check
        let cachedData = null;
        try {
            if (redis) {
                cachedData = await redis.get(CACHE_KEY);
            }
        } catch (e) {
            console.warn("Redis issue:", e);
        }

        if (cachedData) {
            return NextResponse.json(JSON.parse(cachedData));
        }

        // 3. Fetch Data from Backend API
        let ordersRaw = [];
        try {
            const response = await axios.get(BACKEND_URL);
            ordersRaw = response.data?.rows || [];
        } catch (err) {
            console.error("Backend fetch error:", err);
        }

        // 4. Fetch Promos & Inventory from Prisma
        let activePromos = 0;
        let activeDiscounts = 0;
        let activePromoList: any[] = [];
        let activeDiscountList: any[] = [];
        let totalQty = 0;
        let lowStockItems: any[] = [];
        try {
            const results = await Promise.allSettled([
                prisma.promo.count({
                    where: { status: "active", start_date: { lte: now }, end_date: { gte: now } }
                }),
                prisma.product_variants.findMany({
                    where: { stok: { lt: 10 } },
                    include: { product: true },
                    take: 5
                })
            ]);

            if (results[0].status === 'fulfilled') {
                const promos: any = await prisma.promo.findMany({
                    where: { 
                        status: { in: ["active", "ACTIVE"] },
                        start_date: { lte: now }, 
                        end_date: { gte: now } 
                    },
                    select: { id: true, title: true, type: true, value: true }
                });
                
                const discounts = await prisma.discount.findMany({
                    where: { is_active: true },
                    select: { id: true, name: true, type: true, value: true }
                });
                activePromoList = promos.map((p: any) => ({
                    id: p.id,
                    name: p.title,
                    type: "CAMPAIGN",
                    discount: p.type === 'percentage' ? `${p.value}%` : `Rp ${Number(p.value).toLocaleString()}`
                }));

                activeDiscountList = discounts.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    type: "DISCOUNT",
                    discount: d.type === 'percentage' ? `${d.value}%` : `Rp ${Number(d.value).toLocaleString()}`
                }));

                activePromos = activePromoList.length;
                activeDiscounts = activeDiscountList.length;
            }
            if (results[1].status === 'fulfilled') {
                const lowStock: any = results[1].value;
                lowStockItems = lowStock.map((ls: any) => ({
                    id: ls.id,
                    name: ls.product?.name || "Product",
                    variant: ls.size || ls.desc || "Standard",
                    stok: ls.stok || 0
                }));
            }
        } catch (e) {
            console.warn("Prisma error for promos or inventory:", e);
        }

        // 5. Processing Analytics
        let totalRevenue = 0;
        let totalOrders = 0;
        let todayRevenue = 0;
        let todayOrders = 0;
        let yesterdayRevenue = 0;
        let yesterdayOrders = 0;

        const categorySales: Record<string, number> = {};
        const productSales: Record<string, {name: string, price: number, qty: number, image: string | null}> = {};
        const dailyOrders: Record<string, number> = {};
        const dailyRevenue: Record<string, number> = {};
        const variantSales: Record<string, number> = {};
        const chartMap: Record<string, string> = {};
        const orderedDates: string[] = [];

        const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        for (let i = 0; i < 7; i++) {
            const d = new Date(mondayStart);
            d.setDate(mondayStart.getDate() + i);
            const dateStr = d.toLocaleDateString("en-CA");
            orderedDates.push(dateStr);
            dailyOrders[dateStr] = 0;
            dailyRevenue[dateStr] = 0;
            chartMap[dateStr] = dayNames[i];
        }

        const todayStr = now.toLocaleDateString("en-CA");
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(now.getDate() - 1);
        const yesterdayStr = yesterdayDate.toLocaleDateString("en-CA");

        // 5. Processing Analytics with Prisma Enrichment
        const transactions = ordersRaw.filter((t: any) => {
            const status = (t.status || "").toUpperCase();
            if (status !== "PAID" && status !== "COMPLETED") return false;
            const tDate = new Date(t.created || t.created_at || t.updated_at);
            return tDate >= mondayStart;
        });

        for (const t of transactions) {
            const tDate = new Date(t.created || t.created_at || t.updated_at);
            const dateStr = tDate.toLocaleDateString("en-CA");
            const amount = Number(t.total_amount || t.total || t.amount || 0);

            totalRevenue += amount;
            totalOrders++;

            if (dateStr === todayStr) {
                todayRevenue += amount;
                todayOrders++;
            } else if (dateStr === yesterdayStr) {
                yesterdayRevenue += amount;
                yesterdayOrders++;
            }

            if (dailyOrders[dateStr] !== undefined) {
                dailyOrders[dateStr]++;
                dailyRevenue[dateStr] += amount;
            }

            const products = Array.isArray(t.products) ? t.products : [];
            for (const p of products) {
                const pid = Number(p.id || p._id);
                // Hitung QTY dengan logic yang sama seperti order/page.tsx
                const qty = Number(p.variants?.[0]?.quantity || p.quantity || p.qty || 1);
                const pPrice = Number(p.price || 0);

                totalQty += qty;

                if (!productSales[pid]) {
                    productSales[pid] = { name: p.name || "Product", price: pPrice, qty: 0, image: p.image || null };
                }
                productSales[pid].qty += qty;

                // AMBIL KATEGORI DARI PRISMA jika di API tidak ada
                let cats: any[] = Array.isArray(p.categories) ? p.categories : [];
                if (cats.length === 0) {
                    try {
                        const dbCats = await prisma.product_category_trx.findMany({
                            where: { product_id: pid },
                            include: { product_category: true }
                        });
                        if (dbCats && dbCats.length > 0) {
                            cats = dbCats.map((c: any) => ({ name: c.product_category?.name || "Other" }));
                        } else {
                            cats = [{ name: "General" }];
                        }
                    } catch (e) {
                        cats = [{ name: "Other" }];
                    }
                }

                cats.forEach((c: any) => {
                    const cName = c.name || "General";
                    categorySales[cName] = (categorySales[cName] || 0) + qty;
                });

                // AMBIL VARIAN DARI PRISMA jika di API tidak ada
                let vars: any[] = Array.isArray(p.variants) ? p.variants : [];
                if (vars.length === 0 && p.variant_id) {
                    try {
                        const dbVar = await prisma.product_variants.findUnique({
                            where: { id: Number(p.variant_id) }
                        });
                        if (dbVar) vars = [{ name: dbVar.size || dbVar.desc || "Standard" }];
                    } catch (e) {}
                }

                if (vars.length === 0) {
                    vars = [{ name: "Standard" }];
                }

                vars.forEach((v: any) => {
                    const vName = v.name || "Standard";
                    variantSales[vName] = (variantSales[vName] || 0) + qty;
                });
            }
        }

        const calcTrend = (nowV: number, oldV: number) => {
            if (oldV === 0) return nowV > 0 ? 100 : 0;
            return Math.round(((nowV - oldV) / oldV) * 100);
        };

        // 6. Enrichment: Get Images from Prisma for Trending Items
        const trendingRaw = Object.keys(productSales)
            .map(id => ({
                id,
                name: productSales[id].name,
                image: productSales[id].image,
                sales: productSales[id].qty,
                price: productSales[id].price,
                type: "Best Seller"
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        const trending = await Promise.all(trendingRaw.map(async (item) => {
            if (!item.image) {
                try {
                    // Temukan gambar dari salah satu varian produk ini
                    const vImg = await prisma.product_variant_images.findFirst({
                        where: { product_variants: { product_id: Number(item.id) } },
                        select: { image: true }
                    });
                    if (vImg && vImg.image) return { ...item, image: vImg.image };
                } catch (e) {}
            }
            return item;
        }));

        const stats = {
            revenue: totalRevenue,
            revenueTrend: calcTrend(todayRevenue, yesterdayRevenue),
            orders: totalOrders,
            totalQty,
            orderTrend: calcTrend(todayOrders, yesterdayOrders),
            activePromos,
            trending,
            charts: {
                revenue: orderedDates.map(d => ({ day: chartMap[d], currentWeek: dailyRevenue[d], lastWeek: 0 })),
                orders: orderedDates.map(d => ({ day: chartMap[d], currentWeek: dailyOrders[d], lastWeek: 0 })),
                categories: Object.keys(categorySales).map(n => ({ category: n, value: categorySales[n] })),
                variants: Object.keys(variantSales).map(n => ({ name: n, value: variantSales[n] })),
            },
            recentItems: transactions.slice(0, 6).map((t: any) => {
                const tDate = new Date(t.created || t.created_at || t.updated_at);
                return {
                    order_id: (t._id || t.id || t.order_number || "").substring(0, 8),
                    name: t.user?.nickname || "Customer",
                    amount: Number(t.total_amount || t.total || 0),
                    status: (t.status || "PAID").toUpperCase(),
                    initials: (t.user?.nickname || "C").substring(0, 1).toUpperCase(),
                    date: tDate.toISOString()
                };
            }),
            lowStock: lowStockItems,
            activePromoList,
            activeDiscounts,
            activeDiscountList,
            updatedAt: new Date().toISOString()
        };

        try {
            if (redis) {
                await redis.set(CACHE_KEY, JSON.stringify(stats), "EX", CACHE_TTL);
            }
        } catch (e) {}

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard Final Error:", error);
        return NextResponse.json({ error: "Failed fetch stats" }, { status: 500 });
    }
}
