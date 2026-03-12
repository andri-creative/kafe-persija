/**
 * Helper function to get variant image URL
 * @param filename - Variant image filename from database
 * @returns Full public URL path
 */
export function getVariantImageUrl(filename: string | null): string {
    if (!filename) return '/images/placeholder.png'; // Default placeholder

    // If it's a relative path starting with /images, handle it for backward compatibility
    if (filename.startsWith('/images/variant/')) return filename;
    
    // If it's another absolute path, return as-is
    if (filename.startsWith('/')) return filename;

    // Construct path for filename-only format
    return `/images/variant/${filename}`;
}
