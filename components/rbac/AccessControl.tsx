"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Permission } from "@/types/rbac";
import { hasPermission, hasAnyPermission } from "@/lib/rbac";

interface AccessControlProps {
    /**
     * Single permission required to see the content.
     */
    permission?: Permission;
    /**
     * List of permissions where at least one is required.
     */
    anyPermission?: Permission[];
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
 * It uses the NextAuth session to get the user's roles and permissions.
 */
export const AccessControl: React.FC<AccessControlProps> = ({
    permission,
    anyPermission,
    fallback = null,
    children,
}) => {
    const { data: session, status } = useSession();

    // While checking session, show nothing (or a loading skeleton if needed)
    if (status === "loading") return null;

    const userPermissions = (session as any)?.user?.permissions || (session as any)?.user?.roles || [];

    let allowed = false;

    if (permission) {
        allowed = hasPermission(userPermissions, permission);
    } else if (anyPermission) {
        allowed = hasAnyPermission(userPermissions, anyPermission);
    } else {
        // If no permission specified, allow by default (or handle as needed)
        allowed = true;
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
