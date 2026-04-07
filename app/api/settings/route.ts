import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengaturan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, value, description } = body;

    if (!name || !value) {
      return NextResponse.json({ error: "Nama dan Value wajib diisi" }, { status: 400 });
    }

    const newSetting = await prisma.setting.create({
      data: {
        name,
        value,
        description,
      },
    });

    return NextResponse.json(newSetting);
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Gagal membuat pengaturan baru" }, { status: 500 });
  }
}
