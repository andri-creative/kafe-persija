"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useProducts } from "@/hooks/useProducts";
import { useProductFilter } from "@/hooks/useProductFilter";
import { ProductHeader } from "./_components/ProductHeader";
import { ProductFilters } from "./_components/ProductFilters";
import { ProductTable } from "./_components/ProductTable";
import { ProductEmptyState } from "./_components/ProductEmptyState";
import { ProductLoading } from "./_components/ProductLoading"
import { PaginationGlobal } from "@/components/paginate-global";
import { AccessControl } from "@/components/rbac/AccessControl";
import { Separator } from "@/components/ui/separator";

export default function ProductPage() {
  const { products, loading, deleteProduct, updateProductStatus, fetchProducts } = useProducts();
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

  if (loading) return <ProductLoading />;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        theme="light"
        className="text-sm"
      />

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
                label="produk"
              />
            )}
          </>
        )}
      </AccessControl>

      <AccessControl permission="product_create" fallback={<p className="text-xs text-muted-foreground italic px-6">Anda tidak memiliki izin untuk menambah produk.</p>}>
        <div className="hidden" />
      </AccessControl>
    </div>
  );
}
