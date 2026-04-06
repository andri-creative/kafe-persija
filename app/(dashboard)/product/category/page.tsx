"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { CategoryTable } from "../_components/CategoryTable";
import CreateCategory from "../_components/create-category";
import { useEffect, useState } from "react";
import { PaginationGlobal } from "@/components/paginate-global";

import { AccessControl } from "@/components/rbac/AccessControl";
import { usePermissions } from "@/hooks/use-permissions";

import { Category } from "../types";

export default function ProductCategoryPage() {
  const { can } = usePermissions();
  const canCreate = can("category_create");

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);



  const totalPages = Math.ceil(categories.length / pageSize);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={`grid grid-cols-1 ${canCreate ? "lg:grid-cols-3" : ""} gap-6`}>
      <Card className={canCreate ? "lg:col-span-2" : "col-span-1"}>
        <CardHeader className="pb-2">
          <h1 className="text-sm font-bold">Daftar Kategori</h1>
          <p className="text-[10px] text-gray-500">Kelola kategori produk Anda</p>
        </CardHeader>
        <CardContent>
          <CategoryTable
            categories={paginatedCategories}
            currentPage={currentPage}
            pageSize={pageSize}
            onDelete={(id: number) => {
              setCategories((prev) => prev.filter((c) => c.id !== id));
              if (paginatedCategories.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
          />
          <PaginationGlobal
            currentPage={currentPage}
            totalPages={totalPages}
            total={categories.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            label="kategori"
          />
        </CardContent>
      </Card>

      <AccessControl permission="category_create">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <h1 className="text-sm font-bold">New Category</h1>
            <p className="text-[10px] text-gray-500">Create new category</p>
          </CardHeader>
          <CardContent>
            <CreateCategory
              onCreated={(newCategory) => {
                setCategories((prev) => [newCategory, ...prev]);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      </AccessControl>
    </div>
  );
}
