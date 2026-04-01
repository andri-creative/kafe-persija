"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/category-helper";
import { toast } from "react-toastify";
import { BaseDataTable, Column } from "./BaseDataTable";
import { Category } from "../types";

interface TabelCategoryProps {
  categories: Category[];
  onDelete?: (id: number) => void;
}

export function TabelCategory({ categories, onDelete }: TabelCategoryProps) {
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success("Kategori berhasil dihapus");
        onDelete ? onDelete(id) : window.location.reload();
      } else {
        toast.error(data.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Terjadi kesalahan saat menghapus kategori");
    }
  };

  const columns: Column<Category>[] = [
    {
      header: "No",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },
    {
      header: "Kategori",
      className: "font-semibold",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-50 border">
            {category.image ? (
              <Image
                src={getCategoryImageUrl(category.image)}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <Package className="h-5 w-5 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900">{category.name}</span>
            <span className="text-[10px] text-gray-400 capitalize">Category</span>
          </div>
        </div>
      ),
    },
    {
       header: "Dibuat Oleh",
       render: (category) => (
         <div className="flex flex-col">
           <span className="text-gray-700">{category.creator_name || "-"}</span>
           {/* Indonesia/Jakarta format for created at would be nice here if available, or just use "-" */}
         </div>
       )
    },
    {
      header: "Aksi",
      className: "w-[80px] text-right",
      render: (category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 focus:ring-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px] shadow-lg rounded-xl border-gray-100 p-1">
            <Link href={`/product/category/${category.id}/view`}>
              <DropdownMenuItem className="text-xs cursor-pointer rounded-lg hover:bg-blue-50 hover:text-blue-600">
                Detail
              </DropdownMenuItem>
            </Link>
            <Link href={`/product/category/${category.id}/edit`}>
              <DropdownMenuItem className="text-xs cursor-pointer rounded-lg hover:bg-amber-50 hover:text-amber-600">
                Ubah
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="mx-1 my-1 border-gray-100" />
            <DropdownMenuItem
              className="text-xs cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg"
              disabled={(category.product_count ?? 0) > 0}
              onClick={() => handleDelete(category.id, category.name)}
            >
              Hapus {(category.product_count ?? 0) > 0 && "(Dipakai)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <BaseDataTable
      columns={columns}
      data={categories}
      emptyMessage="Kategori tidak ditemukan"
    />
  );
}
