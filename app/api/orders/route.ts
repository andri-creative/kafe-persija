import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const API_BASE = "https://api.dev.accolaplay.id/v2/kafe/dashboard/orders";

/**
 * GET ORDERS
 */
export async function GET() {
  try {
    const res = await fetch(API_BASE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data order" },
      { status: 500 },
    );
  }
}

/**
 * CREATE ORDER (POST)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Deduct stock locally if order was successful
    if (res.ok && body.products) {
      try {
        console.log("📦 Order success, deducting stock locally...");
        for (const product of body.products) {
          if (product.variants) {
            for (const variant of product.variants) {
              const variantId = Number(variant.id || variant.variant_id);
              const qty = Number(variant.quantity || variant.qty);

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
          }
        }
      } catch (stockError) {
        console.error("🚨 Failed to deduct stock locally:", stockError);
        // We still return the order response since the order was successfully created on external server
      }
    }

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: "Gagal membuat order" },
      { status: 500 },
    );
  }
}

