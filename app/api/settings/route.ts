import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, value, description } = body;

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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
