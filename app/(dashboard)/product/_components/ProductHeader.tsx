"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { ButtonsComponentsAdd } from "@/components/buttons-conponents";

interface ProductHeaderProps {
    totalProducts: number;
}

export const ProductHeader = ({ totalProducts }: ProductHeaderProps) => {
    const { can } = usePermissions();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Produk</h1>
                <p className="text-xs text-gray-500">
                    {totalProducts} produk • Kelola produk, kategori, dan varian
                </p>
            </div>
            {can(SYSTEM_PERMISSIONS.PRODUCT_CREATE || "product_create") && (
                <ButtonsComponentsAdd addUrl="/product/create" title="Produk" showText />
            )}
        </div>
    );
};
