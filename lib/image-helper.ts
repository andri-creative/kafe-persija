/**
 * IMAGE_CONFIG - Configuration for image storage and serving
 * Using environment variables where possible for flexibility
 */
export const IMAGE_CONFIG = {
  variant: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH || "c:/projest/img/img-cafe"}/variant`,
    publicBaseUrl: `${process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || "/api/images"}/variant`,
  },
  category: {
    externalPath: `${process.env.IMAGE_STORAGE_PATH || "c:/projest/img/img-cafe"}/category`,
    publicBaseUrl: `${process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || "/api/images"}/category`,
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

    // Backward compatibility for full relative paths
    if (filename.startsWith("/images/")) return filename;
    if (filename.startsWith("/")) return filename;

    const config = IMAGE_CONFIG[type];
    
    // Build URL: BaseServerURL + /type/ + filename
    return `${config.publicBaseUrl}/${filename}`;
  },
};
