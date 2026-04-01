"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { TabelCategory } from "../_components/tabel-category";
import CreateCategory from "../_components/create-category";
import { useEffect, useState } from "react";
import { PaginationGlobal } from "@/components/paginate-global";
import { LogoLoading } from "@/components/logo-loading";

import { Category } from "../types";

export default function ProductCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [minLoading, setMinLoading] = useState(true);
  const pageSize = 5;

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 1500);

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || minLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <LogoLoading width={150} height={150} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Menyiapkan daftar kategori...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(categories.length / pageSize);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <h1 className="text-sm font-bold">Daftar Kategori</h1>
          <p className="text-[10px] text-gray-500">Kelola kategori produk Anda</p>
        </CardHeader>
        <CardContent>
          <TabelCategory
            categories={paginatedCategories}
            onDelete={(id) => {
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

      <Card className="lg:col-span-1 h-fit">
        <CardHeader className="pb-2">
          <h1 className="text-sm font-bold">Tambah Kategori</h1>
          <p className="text-[10px] text-gray-500">Buat kategori produk baru</p>
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
    </div>
  );
}
