import { ImageHelper } from "./image-helper";

/**
 * Helper function to get variant image URL
 * @param filename - Variant image filename from database
 * @returns Full public URL path
 */
export function getVariantImageUrl(filename: string | null): string {
    return ImageHelper.getUrl(filename, 'variant');
}
