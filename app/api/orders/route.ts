import { NextResponse } from "next/server";

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
 * UPDATE ORDER (PUT)
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal update order" },
      { status: 500 },
    );
  }
}
