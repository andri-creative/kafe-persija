"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { ButtonsComponentsAdd } from "@/components/buttons-conponents";
import { AccessControl } from "@/components/rbac/AccessControl";

interface ProductHeaderProps {
    totalProducts: number;
}

export const ProductHeader = ({ totalProducts }: ProductHeaderProps) => {
    const { can } = usePermissions();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Product</h1>
                <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {totalProducts} products • Manage products, categories, and variants
                </p>
            </div>
            <AccessControl permission="product_create">
                <ButtonsComponentsAdd addUrl="/product/create" title="Product" showText />
            </AccessControl>
        </div>
    );
};
