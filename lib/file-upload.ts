import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { FILE_UPLOAD_CONFIG, FileType } from './file-config';

/**
 * Generate unique filename with timestamp
 */
function generateFileName(extension: string = 'webp'): string {
    const now = new Date();
    const timestamp = {
        second: now.getSeconds().toString().padStart(2, '0'),
        minute: now.getMinutes().toString().padStart(2, '0'),
        hour: now.getHours().toString().padStart(2, '0'),
        date: now.getDate().toString().padStart(2, '0'),
        month: (now.getMonth() + 1).toString().padStart(2, '0'),
        year: now.getFullYear().toString(),
    };

    return `${timestamp.second}${timestamp.minute}${timestamp.hour}-${timestamp.date}${timestamp.month}${timestamp.year}-${crypto.randomUUID()}.${extension}`;
}

/**
 * Generic file upload function
 * @param file - File to upload
 * @param type - File type (variant or category)
 * @param saveFilenameOnly - If true, returns only filename instead of full path (for database storage)
 * @returns Public path to uploaded file or just filename if saveFilenameOnly is true
 */
export async function uploadFile(file: File, type: FileType, saveFilenameOnly: boolean = false): Promise<string> {
    try {
        const config = FILE_UPLOAD_CONFIG[type];
        const fileName = generateFileName('webp');

        const uploadDir = path.join(process.cwd(), 'public', config.uploadDir);
        await fs.mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filePath = path.join(uploadDir, fileName);

        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(filePath);

        return saveFilenameOnly ? fileName : `${config.publicPath}/${fileName}`;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
}

/**
 * Delete file from disk
 * @param imagePath - Public path to file (e.g., /images/variant/filename.webp) or just filename
 * @param type - Optional file type, required if imagePath is just a filename
 */
export async function deleteFile(imagePath: string, type?: FileType): Promise<void> {
    try {
        let absolutePath: string;

        if (!imagePath.includes('/') && type) {
            const config = FILE_UPLOAD_CONFIG[type];
            absolutePath = path.join(process.cwd(), 'public', config.uploadDir, imagePath);
        } else {
            absolutePath = path.join(process.cwd(), 'public', imagePath);
        }
        try {
            await fs.access(absolutePath);
        } catch {
            return;
        }

        await fs.unlink(absolutePath);
        console.log(`Deleted file: ${imagePath}`);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

/**
 * Backward compatibility: Upload variant image
 * @deprecated Use uploadFile(file, 'variant') instead
 */
export async function uploadVariantImage(file: File): Promise<string> {
    return uploadFile(file, 'variant', true);
}

/**
 * Backward compatibility: Delete variant image
 * @deprecated Use deleteFile(path) instead
 */
export async function deleteVariantImage(imagePath: string): Promise<void> {
    return deleteFile(imagePath, 'variant');
}

/**
 * Backward compatibility: Save category image
 * @deprecated Use uploadFile(file, 'category') instead
 */
export async function saveImage(file: File, folder: string): Promise<string> {
    if (folder.includes('category')) {
        return uploadFile(file, 'category', true);
    } else if (folder.includes('variant')) {
        return uploadFile(file, 'variant', true);
    }

    return uploadFile(file, 'variant', true);
}
