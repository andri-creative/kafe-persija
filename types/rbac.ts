/**
 * Central source of truth for all system permissions.
 * Follows the pattern: [resource]_[action]
 */
export const SYSTEM_PERMISSIONS = {
    // USER MANAGEMENT
    USER_VIEW: "user_view",
    USER_CREATE: "user_create",
    USER_EDIT: "user_edit",
    USER_DELETE: "user_delete",

    // DISCOUNT MANAGEMENT
    DISCOUNT_VIEW: "discount_view",
    DISCOUNT_CREATE: "discount_create",
    DISCOUNT_EDIT: "discount_edit",
    DISCOUNT_DELETE: "discount_delete",

    // PROMO MANAGEMENT
    PROMO_VIEW: "promo_view",
    PROMO_CREATE: "promo_create",
    PROMO_EDIT: "promo_edit",
    PROMO_DELETE: "promo_delete",

    // SETTING MANAGEMENT
    SETTING_VIEW: "setting_view",
    SETTING_CREATE: "setting_create",
    SETTING_EDIT: "setting_edit",
    SETTING_DELETE: "setting_delete",

    // ROLE & PERMISSION MANAGEMENT (SUPER ADMIN)
    RBAC_VIEW: "rbac_view",
    RBAC_MANAGE: "rbac_manage",

    // PERMISSION CRUD
    PERMISSION_VIEW: "permission_view",
    PERMISSION_CREATE: "permission_create",
    PERMISSION_EDIT: "permission_edit",
    PERMISSION_DELETE: "permission_delete",

    // PRODUCT MANAGEMENT
    PRODUCT_VIEW: "product_view",
    PRODUCT_CREATE: "product_create",
    PRODUCT_EDIT: "product_edit",
    PRODUCT_DELETE: "product_delete",

    // CATEGORY MANAGEMENT
    CATEGORY_VIEW: "category_view",
    CATEGORY_CREATE: "category_create",
    CATEGORY_EDIT: "category_edit",
    CATEGORY_DELETE: "category_delete",

    // TRANSACTION & ORDER
    ORDER_VIEW: "order_view",
    ORDER_MANAGE: "order_manage",
    ORDER_DELETE: "order_delete",

    // REPORTS
    REPORT_VIEW: "report_view",
    REPORT_EXPORT: "report_export",

    // SETTINGS
    SETTINGS_VIEW: "settings_view",
    SETTINGS_EDIT: "settings_edit",

    // ROLES
    ROLES_VIEW: "roles_view",
    ROLES_CREATE: "roles_create",
    ROLES_EDIT: "roles_edit",
    ROLES_DELETE: "roles_delete",
} as const;

export type Permission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: Permission[];
}
