import { ImageHelper } from "./image-helper";

/**
 * Helper function to get category image URL
 * @param filename - Category image filename from database
 * @returns Full public URL path
 */
export function getCategoryImageUrl(filename: string | null | undefined): string {
  return ImageHelper.getUrl(filename, "category");
}
