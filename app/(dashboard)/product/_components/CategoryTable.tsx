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
import { AccessControl } from "@/components/rbac/AccessControl";

import { usePermissions } from "@/hooks/use-permissions";

interface CategoryTableProps {
  categories: Category[];
  currentPage: number;
  pageSize: number;
  onDelete?: (id: number) => void;
}

export function CategoryTable({ categories, currentPage, pageSize, onDelete }: CategoryTableProps) {
  const { canAny } = usePermissions();
  const canSeeActions = canAny(["category_view", "category_edit", "category_delete"]);

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
      render: (_, index) => (
        <span className="font-medium text-gray-500">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      header: "Kategori",
      className: "font-semibold",
      render: (category) => (
        <div className="flex items-center gap-3 py-1">
          <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-white border shadow-sm">
            {category.image ? (
              <Image
                src={getCategoryImageUrl(category.image)}
                alt={category.name}
                fill
                className="object-cover transition-transform hover:scale-110"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <Package className="h-5 w-5 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-900 font-bold tracking-tight">{category.name}</span>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Category</span>
          </div>
        </div>
      ),
    },
    {
      header: "Dibuat Oleh",
      render: (category) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700">{category.creator_name || "System"}</span>
          <span className="text-[9px] text-gray-400 font-medium">Administrator</span>
        </div>
      )
    },
    {
      header: "Aksi",
      className: "w-[100px] text-right pr-4",
      render: (category) => {
        if (!canSeeActions) return <span className="text-gray-300">-</span>;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] shadow-xl rounded-xl border-gray-100 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AccessControl permission="category_view">
                <Link href={`/product/category/${category.id}/view`}>
                  <DropdownMenuItem className="text-xs cursor-pointer rounded-lg hover:bg-blue-50 hover:text-blue-600 font-bold py-2">
                    View Details
                  </DropdownMenuItem>
                </Link>
              </AccessControl>
              <AccessControl permission="category_edit">
                <Link href={`/product/category/${category.id}/edit`}>
                  <DropdownMenuItem className="text-xs cursor-pointer rounded-lg hover:bg-amber-50 hover:text-amber-600 font-bold py-2">
                    Edit Category
                  </DropdownMenuItem>
                </Link>
              </AccessControl>
              <AccessControl permission="category_delete">
                <DropdownMenuSeparator className="mx-1 my-1 border-gray-100" />
                <DropdownMenuItem
                  className="text-xs cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg font-bold py-2"
                  disabled={(category.product_count ?? 0) > 0}
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  Delete {(category.product_count ?? 0) > 0 && "(Not Available)"}
                </DropdownMenuItem>
              </AccessControl>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <BaseDataTable
      columns={canSeeActions ? columns : columns.filter(c => c.header !== "Aksi")}
      data={categories}
      emptyMessage="Kategori tidak ditemukan"
      className="border-none rounded-none shadow-none"
    />
  );
}
