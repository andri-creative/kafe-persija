import { NextResponse } from "next/server";
import { getOrders } from "@/lib/order-api";
import redis from "@/lib/redis";

/**
 * GET Sales Reports Data from Backend API (External)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        // --- REDIS CACHE LOGIC ---
        const cacheKey = `sales_report:${startDateParam || 'default'}:${endDateParam || 'default'}`;
        
        try {
            const cachedBody = await redis.get(cacheKey);
            if (cachedBody) {
                console.log("🚀 [REDIS] Serving Sales Report from Cache:", cacheKey);
                return NextResponse.json(JSON.parse(cachedBody));
            }
        } catch (cacheErr) {
            console.error("⚠️ [REDIS] Cache Get Error:", cacheErr);
            // Continue to fetch from backend if redis fails
        }

        const response = await getOrders();
        
        // DEBUG: Logging untuk melihat struktur data asli dari backend Accolaplay
        console.log("📦 Backend Response:", JSON.stringify(response).slice(0, 500) + "...");

        const rawOrders = Array.isArray(response?.rows) ? response.rows : (Array.isArray(response) ? response : []);

        // 5. Processing & Formatting
        const formattedData = rawOrders
            .filter((order: any) => {
                if (!order) return false;
                
                // Cari tanggal yang tersedia (fallback logic)
                const timestamp = order.created || order.created_at || order.updated_at || order.updated;
                if (!timestamp) return false;

                if (!startDateParam || !endDateParam) return true;
                
                try {
                    const orderDate = new Date(timestamp).toLocaleDateString("en-CA");
                    return orderDate >= startDateParam && orderDate <= endDateParam;
                } catch (e) {
                    return false;
                }
            })
            .map((order: any) => {
                try {
                    const timestamp = order.created || order.created_at || order.updated_at || order.updated;
                    const dateObj = new Date(timestamp || Date.now());
                    
                    // Calculate Total Items (QTY)
                    const products = Array.isArray(order.products) ? order.products : [];
                    const totalQty = products.reduce((sum: number, p: any) => {
                        const q = p?.variants?.[0]?.quantity || p?.quantity || p?.qty || 1;
                        return sum + Number(q);
                    }, 0);

                    // Map payment method safely
                    const method = order.payment?.sources?.[0]?.name || order.payment_method || "CASH";
                    const status = order.payment?.status || order.status || "UNPAID";

                    return {
                        id: order.order_number || (order._id ? `ORD-${String(order._id).slice(-6)}` : `ORD-${Math.random().toString(36).substring(7)}`),
                        time: dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                        date: dateObj.toLocaleDateString("en-CA"),
                        customer: order.table?.[0]?.no_table ? `MEJA ${order.table[0].no_table}` : (order.user?.nickname || order.user_nickname || "TAKE AWAY"),
                        items: totalQty,
                        total: Number(order.total_amount || order.total || order.amount || 0),
                        discount: Number(order.discount_amount || order.discount || 0),
                        promo: Number(order.promo_amount || order.promo || 0),
                        appliedBy: order.admin_name || order.user?.nickname || "-",
                        method: String(method).toUpperCase(),
                        status: String(status).toUpperCase()
                    };
                } catch (mapError) {
                    console.error("❌ Map Error for order:", order?.order_number, mapError);
                    return null;
                }
            })
            .filter(Boolean);
 // Remove null items from map error

        // --- SAVE TO REDIS CACHE (TTL: 5 Minutes / 300s) ---
        try {
            await redis.set(cacheKey, JSON.stringify(formattedData), "EX", 300);
            console.log("✅ [REDIS] Sales Report Cached:", cacheKey);
        } catch (cacheSetErr) {
            console.error("⚠️ [REDIS] Cache Set Error:", cacheSetErr);
        }

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Sales Report API Error (External):", error);
        return NextResponse.json(
            { message: "Gagal mengambil data dari backend" },
            { status: 500 }
        );
    }
}
