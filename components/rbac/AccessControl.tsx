"use client";

import React from "react";
import { Permission } from "@/types/rbac";
import { usePermissions } from "@/hooks/use-permissions";

interface AccessControlProps {
    /**
     * Single permission required to see the content.
     */
    permission?: Permission | string;
    /**
     * List of permissions where at least one is required.
     */
    anyPermission?: (Permission | string)[];
    /**
     * Fallback content to show if the user doesn't have permission.
     */
    fallback?: React.ReactNode;
    /**
     * The content to protect.
     */
    children: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders children based on the user's permissions.
 * It uses the usePermissions hook to get the user's dynamically updated permissions.
 */
export const AccessControl: React.FC<AccessControlProps> = ({
    permission,
    anyPermission,
    fallback = null,
    children,
}) => {
    const { can, canAny, loading } = usePermissions();

    if (loading) return null;

    let allowed = false;

    if (permission) {
        allowed = can(permission as string);
    } else if (anyPermission) {
        allowed = canAny(anyPermission as string[]);
    } else {
        allowed = true;
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
