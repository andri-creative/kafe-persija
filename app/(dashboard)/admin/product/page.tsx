"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useProducts } from "@/hooks/useProducts";
import { useProductFilter } from "@/hooks/useProductFilter";
import { ProductHeader } from "@/app/(dashboard)/admin/product/_components/ProductHeader";
import { ProductFilters } from "@/app/(dashboard)/admin/product/_components/ProductFilters";
import { ProductTable } from "@/app/(dashboard)/admin/product/_components/ProductTable";
import { ProductEmptyState } from "@/app/(dashboard)/admin/product/_components/ProductEmptyState";
import { ProductLoading } from "./_components/ProductLoading"
import { ProductPagination } from "@/app/(dashboard)/admin/product/_components/ProductPagination";

export default function ProductPage() {
  const { products, loading, deleteProduct, updateProductStatus, fetchProducts } = useProducts();
  const {
    search,
    setSearch,
    selectedStatus,
    setSelectedStatus,
    filteredProducts,
    uniqueStatuses,
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
            products={filteredProducts}
            onStatusChange={updateProductStatus}
            onDelete={deleteProduct}
          />

          {filteredProducts.length > 0 && (
            <ProductPagination
              total={products.length}
              filtered={filteredProducts.length}
              search={search}
              status={selectedStatus}
            />
          )}
        </>
      )}
    </div>
  );
}