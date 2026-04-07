import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  // Proteksi Total untuk Docker/Build Phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const { id } = await params;
    
    if (!id || id === "[id]") {
       return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { value, description } = body;

    const settingId = Number(id);
    if (isNaN(settingId)) {
        return NextResponse.json({ error: "ID must be a number" }, { status: 400 });
    }

    const updatedSetting = await prisma.setting.update({
      where: { id: settingId },
      data: {
        value,
        description,
      },
    });

    return NextResponse.json(updatedSetting);
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  // Proteksi Total untuk Docker/Build Phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const { id } = await params;

    if (!id || id === "[id]") {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const settingId = Number(id);
    if (isNaN(settingId)) {
        return NextResponse.json({ error: "ID must be a number" }, { status: 400 });
    }

    await prisma.setting.delete({
      where: { id: settingId },
    });

    return NextResponse.json({ message: "Pengaturan berhasil dihapus" });
  } catch (error: any) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus pengaturan" }, { status: 500 });
  }
}
