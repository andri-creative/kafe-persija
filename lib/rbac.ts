import { Permission } from "@/types/rbac";

/**
 * Check if user permissions includes a specific permission.
 * Hanya berdasarkan apa yang ada di DB — tidak ada bypass.
 */
export function hasPermission(
    userPermissions: string[] | undefined | null,
    requiredPermission: Permission | string,
): boolean {
    if (!userPermissions || userPermissions.length === 0) return false;
    return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has at least one of the required permissions.
 */
export function hasAnyPermission(
    userPermissions: string[] | undefined | null,
    requiredPermissions: (Permission | string)[],
): boolean {
    if (!userPermissions || userPermissions.length === 0) return false;
    return requiredPermissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if user has ALL of the required permissions.
 */
export function hasAllPermissions(
    userPermissions: string[] | undefined | null,
    requiredPermissions: (Permission | string)[],
): boolean {
    if (!userPermissions || userPermissions.length === 0) return false;
    return requiredPermissions.every((p) => userPermissions.includes(p));
}
