"use client";

import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProductEmptyState = () => {
    return (
        <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Belum ada produk
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                Mulai dengan menambahkan produk pertama Anda
            </p>
            <Link href="/admin/product/create">
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Produk Pertama
                </Button>
            </Link>
        </div>
    );
};