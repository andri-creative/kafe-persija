/**
 * IMAGE_CONFIG - Configuration for image storage and serving
 * Using environment variables where possible for flexibility
 */
export const IMAGE_CONFIG = {
  variant: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH}/variant`,
    publicBaseUrl: `${process.env.NEXT_PUBLIC_IMAGE_SERVER_URL}/variant`,
  },
  category: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH}/category`,
    publicBaseUrl: `${process.env.NEXT_PUBLIC_IMAGE_SERVER_URL}/category`,
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

    // 1. If absolute URL, return as-is
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        return filename;
    }

    // 2. Handle legacy paths from database (e.g., /images/categories/xxx.webp)
    // We clean them up to use the new API/CDN based on config.
    let cleanFilename = filename;
    if (filename.startsWith("/images/categories/")) {
        cleanFilename = filename.replace("/images/categories/", "");
    } else if (filename.startsWith("/images/variant/")) {
        cleanFilename = filename.replace("/images/variant/", "");
    } else if (filename.startsWith("/images/variants/")) {
        cleanFilename = filename.replace("/images/variants/", "");
    } else if (filename.startsWith("/")) {
        // Generic leading slash removal to avoid double slashes with base URL
        cleanFilename = filename.substring(1);
    }

    const config = IMAGE_CONFIG[type];
    
    // 3. Build URL: BaseServerURL + /type/ + filename
    // Ensure we don't return malformed URLs if config is missing
    const baseUrl = config.publicBaseUrl || "/api/images/" + type;
    return `${baseUrl}/${cleanFilename}`;
  },
};
