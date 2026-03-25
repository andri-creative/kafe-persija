import { useState, useMemo, useEffect } from "react";
import { Product, STATUS_PRIORITY } from "@/types/product";

export const useProductFilter = (products: Product[]) => {
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage]);

    // Reset page to 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedStatus, products.length]);

    return {
        search,
        setSearch,
        selectedStatus,
        setSelectedStatus,
        filteredProducts,
        uniqueStatuses,
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,
        paginatedProducts,
    };
};