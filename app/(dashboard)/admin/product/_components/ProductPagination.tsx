"use client";

import { Button } from "@/components/ui/button";

interface ProductPaginationProps {
    total: number;
    filtered: number;
    search?: string;
    status?: string;
}

export const ProductPagination = ({ total, filtered, search, status }: ProductPaginationProps) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-700">
                Menampilkan {filtered} dari {total} produk
                {search && ` • Pencarian: "${search}"`}
                {status && status !== "all" && ` • Status: ${status}`}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={filtered <= 10} className="h-8 text-xs">
                    Previous
                </Button>
                <Button size="sm" className="h-8 w-8 text-xs">1</Button>
                <Button variant="outline" size="sm" disabled={filtered <= 10} className="h-8 text-xs">
                    Next
                </Button>
            </div>
        </div>
    );
};