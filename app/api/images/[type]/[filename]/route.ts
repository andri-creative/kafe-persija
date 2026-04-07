import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { IMAGE_CONFIG, ImageType } from "@/lib/image-helper";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    const { type, filename } = await params;

    // Validate type
    if (type !== 'variant' && type !== 'category') {
      return new NextResponse("Invalid image type", { status: 400 });
    }

    const config = IMAGE_CONFIG[type as ImageType];
    const filePath = path.resolve(config.externalPath, filename);

    try {
      await fs.access(filePath);
    } catch (e) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const extension = filename.split('.').pop()?.toLowerCase();
    
    let contentType = "image/webp";
    if (extension === "png") contentType = "image/png";
    if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg";
    if (extension === "gif") contentType = "image/gif";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving external image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
