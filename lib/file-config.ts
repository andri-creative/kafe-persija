/**
 * Centralized file upload configuration
 * Defines upload directories and public paths for different file types
 */

export const FILE_UPLOAD_CONFIG = {
    variant: {
        uploadDir: 'images/variant',
        publicPath: '/images/variant',
    },
    category: {
        uploadDir: 'images/categories',
        publicPath: '/images/categories',
    },
} as const;

export type FileType = keyof typeof FILE_UPLOAD_CONFIG;
