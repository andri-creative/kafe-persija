import prisma from "@/lib/prisma"
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const discounts = await prisma.discount.findMany();
        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}