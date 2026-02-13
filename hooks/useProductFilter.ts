import { useState, useMemo } from "react";
import { Product, STATUS_PRIORITY } from "@/types/product";

export const useProductFilter = (products: Product[]) => {
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                const matchesSearch =
                    product.name.toLowerCase().includes(search.toLowerCase()) ||
                    product.description?.toLowerCase().includes(search.toLowerCase());
                const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const priorityA = STATUS_PRIORITY[a.status] || 4;
                const priorityB = STATUS_PRIORITY[b.status] || 4;
                return priorityA - priorityB;
            });
    }, [products, search, selectedStatus]);

    const uniqueStatuses = useMemo(() => {
        return Array.from(new Set(products.map((p) => p.status)));
    }, [products]);

    return {
        search,
        setSearch,
        selectedStatus,
        setSelectedStatus,
        filteredProducts,
        uniqueStatuses,
    };
};