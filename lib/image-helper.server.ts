import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { IMAGE_CONFIG, ImageType } from "./image-helper";

/**
 * ImageHelperServer - Server-side ONLY image operations
 * Optimized for Node.js environment
 */
export const ImageHelperServer = {
  /**
   * Generate a unique filename with timestamp
   */
  generateName(extension: string = "webp"): string {
    const now = new Date();
    const timestamp =
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0") +
      "-" +
      now.getDate().toString().padStart(2, "0") +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getFullYear().toString();

    return `${timestamp}-${crypto.randomUUID()}.${extension}`;
  },

  /**
   * Upload an image to the local disk
   */
  async upload(file: File, type: ImageType): Promise<string> {
    try {
      const config = IMAGE_CONFIG[type];
      const fileName = this.generateName("webp");
      const uploadDir = config.externalPath;

      await fs.mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, fileName);

      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(filePath);

      return fileName;
    } catch (error) {
      console.error(`Error uploading image to ${type}:`, error);
      throw new Error("FAILED_TO_UPLOAD_IMAGE");
    }
  },

  /**
   * Delete an image from disk
   */
  async delete(filename: string | null | undefined, type: ImageType): Promise<void> {
    if (!filename) return;

    try {
      const config = IMAGE_CONFIG[type];
      const cleanFilename = filename.split("/").pop() || filename;
      const absolutePath = path.join(
        config.externalPath,
        cleanFilename
      );

      try {
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
        console.log(`Successfully deleted image: ${cleanFilename} from ${type}`);
      } catch (accessError) {
        // File doesn't exist, ignore
      }
    } catch (error) {
      console.error(`Error deleting image ${filename} from ${type}:`, error);
    }
  },

  /**
   * Update an image (delete old if exists, upload new)
   */
  async update(
    newFile: File,
    type: ImageType,
    oldFilename?: string | null | undefined
  ): Promise<string> {
    if (oldFilename) {
      await this.delete(oldFilename, type);
    }
    return await this.upload(newFile, type);
  },
};
