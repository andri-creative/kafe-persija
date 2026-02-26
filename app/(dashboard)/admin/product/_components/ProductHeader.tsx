"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductHeaderProps {
    totalProducts: number;
}

export const ProductHeader = ({ totalProducts }: ProductHeaderProps) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Produk</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                    {totalProducts} produk • Kelola produk, kategori, dan varian
                </p>
            </div>
            <Link href="/admin/product/create">
                <Button className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm gap-1.5">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Tambah Produk
                </Button>
            </Link>
        </div>
    );
};
