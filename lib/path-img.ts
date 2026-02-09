import fs from 'fs/promises';
import path from 'path';

export async function uploadVariantImage(file: File): Promise<string> {
  try {
    const now = new Date();
    const timestamp = {
      second: now.getSeconds().toString().padStart(2, '0'),
      minute: now.getMinutes().toString().padStart(2, '0'),
      hour: now.getHours().toString().padStart(2, '0'),
      date: now.getDate().toString().padStart(2, '0'),
      month: (now.getMonth() + 1).toString().padStart(2, '0'), 
      year: now.getFullYear().toString(),
    };
    
    const fileName = `${timestamp.second}${timestamp.minute}${timestamp.hour}-${timestamp.date}${timestamp.month}${timestamp.year}.webp`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'variant');
    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return `/images/variant/${fileName}`;

  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteVariantImage(imagePath: string): Promise<void> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', imagePath);
    
    try {
      await fs.access(absolutePath);
    } catch {
      return;
    }
    
    await fs.unlink(absolutePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}