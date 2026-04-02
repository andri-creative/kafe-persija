/**
 * IMAGE_CONFIG - Configuration for image storage and serving
 * Using environment variables where possible for flexibility
 */
let SERVER_URL = "/api/images";
if (typeof process !== "undefined" && process.env.IMAGE_CDN_URL) {
    SERVER_URL = process.env.IMAGE_CDN_URL;
}

export const IMAGE_CONFIG = {
  variant: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH}/variant`,
    publicBaseUrl: SERVER_URL.endsWith("/variant") ? SERVER_URL : `${SERVER_URL}/variant`,
  },
  category: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH}/category`,
    publicBaseUrl: SERVER_URL.endsWith("/category") ? SERVER_URL : `${SERVER_URL}/category`,
  },
} as const;

export type ImageType = keyof typeof IMAGE_CONFIG;

/**
 * ImageHelper - Client-safe image utilities
 * Only includes configuration and URL resolution
 */
export const ImageHelper = {
  /**
   * Get the public URL for an image
   * @param filename Filename from database
   * @param type Image category (variant | category)
   * @returns Full public URL path
   */
  getUrl(filename: string | null | undefined, type: ImageType): string {
    if (!filename) return "/images/placeholder.png";

    // DEBUG: Uncomment to see image resolution in browser console
    // console.log(`[ImageHelper] Input: ${filename}, Type: ${type}`);

    // 1. If absolute URL, return as-is
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        return filename;
    }

    // 2. Handle legacy paths from database (e.g., /images/categories/xxx.webp)
    let cleanFilename = filename;
    
    // Exact match and case-insensitive check
    const legacyPatterns = [
        "/images/categories/",
        "/images/variant/",
        "/images/variants/",
        "images/categories/",
        "images/variant/",
        "images/variants/"
    ];

    for (const pattern of legacyPatterns) {
        if (cleanFilename.includes(pattern)) {
            cleanFilename = cleanFilename.split(pattern).pop() || cleanFilename;
            break;
        }
    }

    // Remove leading slash if any remains
    if (cleanFilename.startsWith("/")) {
        cleanFilename = cleanFilename.substring(1);
    }

    const config = IMAGE_CONFIG[type];
    const baseUrl = config.publicBaseUrl || "/api/images/" + type;
    const finalUrl = `${baseUrl}/${cleanFilename}`;
    
    // console.log(`[ImageHelper] Final: ${finalUrl}`);
    return finalUrl;
  },
};
