"use client";

import { Search, RotateCcw, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductInputField, ProductSelectField } from "./ProductFormFields";

interface ProductFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    selectedStatus: string;
    onStatusChange: (value: string) => void;
    uniqueStatuses: string[];
    onRefresh: () => void;
}

export const ProductFilters = ({
    search,
    onSearchChange,
    selectedStatus,
    onStatusChange,
    uniqueStatuses,
    onRefresh,
}: ProductFiltersProps) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Search */}
                <div className="md:col-span-5">
                    <ProductInputField
                        placeholder="Search product..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        leftIcon={<Search className="h-3.5 w-3.5" />}
                        className="bg-slate-50/50 border-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="md:col-span-3">
                    <ProductSelectField
                        value={selectedStatus}
                        onValueChange={onStatusChange}
                        placeholder="All Status"
                        options={[
                            { value: "all", label: "All Status" },
                            ...uniqueStatuses.map(status => ({
                                value: status,
                                label: status === "active" ? "🟢 Active" :
                                       status === "inactive" ? "🔴 Inactive" :
                                       status === "Non Stok" ? "🟡 Non Stok" : status
                            }))
                        ]}
                    />
                </div>

                {/* Actions */}
                <div className="md:col-span-4 flex gap-2">
                    <Link href="/product/category" className="flex-1">
                        <Button variant="outline" className="w-full h-9 text-xs font-bold border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-xl gap-2 transition-all active:scale-95 shadow-sm">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Category
                        </Button>
                    </Link>
                    <Button 
                        variant="secondary" 
                        onClick={onRefresh} 
                        className="flex-1 h-9 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    );
};
