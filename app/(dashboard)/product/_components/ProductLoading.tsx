"use client";

import { Loader2 } from "lucide-react";

export const ProductLoading = () => {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600" />
                <p className="text-xs sm:text-sm text-gray-600">Memuat data produk...</p>
            </div>
        </div>
    );
};
