/**
 * Helper function to get category image URL
 * @param filename - Category image filename from database
 * @returns Full public URL path
 */
export function getCategoryImageUrl(filename: string | null): string {
    if (!filename) return '/images/placeholder.png'; // Default placeholder

    // If already a full path (starts with /), return as-is for backward compatibility
    if (filename.startsWith('/')) return filename;

    // Construct path for filename-only format
    return `/images/categories/${filename}`;
}
