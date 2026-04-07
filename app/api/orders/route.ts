import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import orderApi from "@/lib/order-api";

export const dynamic = "force-dynamic";

/**
 * GET ORDERS
 */
export async function GET(req: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const response = await orderApi.get("/orders");
    
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("GET Orders Error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: "Gagal mengambil data order" },
      { status: error.response?.status || 500 },
    );
  }
}

/**
 * CREATE ORDER (POST)
 */
export async function POST(req: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const body = await req.json();

    // Log URL yang dipanggil
    const fullUrl = `${orderApi.defaults.baseURL}/orders`;
    console.log(`📡 Sending POST Order to: ${fullUrl}`);

    // Use axios (orderApi) for POST
    const response = await orderApi.post("/orders", body);
    const data = response.data;
    
    console.log("🚀 ~ POST ~ data:", data);

    // Deduct stock locally if order was successful
    if (response.status === 201 || response.status === 200) {
      if (body.items && Array.isArray(body.items)) {
        try {
          console.log("📦 Order success, deducting stock locally...");
          for (const item of body.items) {
            const variantId = Number(item.variantId || item.variant_id);
            const qty = Number(item.quantity || item.qty);

            if (variantId && qty) {
              console.log(`📉 Deducting variant ${variantId} by ${qty}`);
              await prisma.product_variants.update({
                where: { id: variantId },
                data: {
                  stok: {
                    decrement: qty
                  }
                }
              });
            }
          }
        } catch (stockError) {
          console.error("🚨 Failed to deduct stock locally:", stockError);
        }
      }
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("POST Order Error:", error.response?.data || error.message);
    return NextResponse.json(
      { 
        message: "Gagal membuat order", 
        detail: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 },
    );
  }
}

