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
  try {
    const { id } = await params;
    const body = await request.json();
    const { value, description } = body;

    if (!id) {
      return NextResponse.json({ error: "ID wajib disertakan" }, { status: 400 });
    }

    const updatedSetting = await prisma.setting.update({
      where: { id: Number(id) },
      data: {
        value,
        description,
      },
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID wajib disertakan" }, { status: 400 });
    }

    await prisma.setting.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Pengaturan berhasil dihapus" });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengaturan" }, { status: 500 });
  }
}
