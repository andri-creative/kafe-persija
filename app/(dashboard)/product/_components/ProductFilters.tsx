"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {uniqueStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status === "active" ? "Active" :
                                    status === "inactive" ? "Inactive" :
                                        status === "Non Stok" ? "Non Stok" : status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href="/product/category" className="flex-1">
                        <Button variant="outline" className="w-full h-9 text-xs">
                            Kategori
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={onRefresh} className="flex-1 h-9 text-xs">
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    );
};
