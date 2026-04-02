"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useProductFilter } from "@/hooks/useProductFilter";
import { ProductHeader } from "./_components/ProductHeader";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductTable } from "./_components/ProductTable";
import { ProductEmptyState } from "./_components/ProductEmptyState";
import { LogoLoading } from "@/components/logo-loading";
import { PaginationGlobal } from "@/components/paginate-global";
import { AccessControl } from "@/components/rbac/AccessControl";

export default function ProductPage() {
  const { products, loading, deleteProduct, updateProductStatus, fetchProducts } = useProducts();
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const {
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
  } = useProductFilter(products);

  if (loading || minLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <LogoLoading width={150} height={150} />
      <div className="space-y-1 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Your products will appear in a moment</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <AccessControl permission="product_view">
        <ProductHeader totalProducts={products.length} />

        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          uniqueStatuses={uniqueStatuses}
          onRefresh={fetchProducts}
        />

        {products.length === 0 ? (
          <ProductEmptyState />
        ) : (
          <>
            <ProductTable
              products={paginatedProducts}
              onStatusChange={updateProductStatus}
              onDelete={deleteProduct}
            />

            {filteredProducts.length > 0 && (
              <PaginationGlobal
                currentPage={currentPage}
                totalPages={totalPages}
                total={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                label="product"
              />
            )}
          </>
        )}
      </AccessControl>

      <AccessControl permission="product_create" fallback={<p className="text-xs text-muted-foreground italic px-6">You don't have permission to add products.</p>}>
        <div className="hidden" />
      </AccessControl>
    </div>
  );
}
