import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function saveImage(
  file: File,
  folder: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const now = new Date();
  const fileName = `${String(now.getSeconds()).padStart(2, "0")}` +
    `${String(now.getMinutes()).padStart(2, "0")}` +
    `${String(now.getHours()).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${now.getFullYear()}.webp`;

  const uploadDir = path.join(process.cwd(), "public", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);

  // convert ke webp
  await sharp(buffer)
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/${folder}/${fileName}`;
}
