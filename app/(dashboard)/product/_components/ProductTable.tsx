"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, formatDate, getCategories, getVariantImage, getActiveVariants, getStatusColor } from "@/lib/product-utils";
import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { Product } from "../types";
import { BaseDataTable, Column } from "./BaseDataTable";
import { AccessControl } from "@/components/rbac/AccessControl";

interface ProductTableProps {
  products: Product[];
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export const ProductTable = ({ products, onStatusChange, onDelete }: ProductTableProps) => {
  const { can } = usePermissions();
  const canEditProduct = can(SYSTEM_PERMISSIONS.PRODUCT_EDIT || "product_edit");

  const columns: Column<Product>[] = [
    {
      header: "Product",
      render: (product) => {
        const variantImage = getVariantImage(product.product_variants);
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 border dark:border-zinc-700">
              {variantImage ? (
                <Image src={variantImage} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-300 dark:text-zinc-600" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-zinc-100 truncate max-w-[150px]">{product.name}</div>
              {product.description && (
                <div className="text-[10px] text-gray-400 dark:text-zinc-500 truncate max-w-[150px]">{product.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      render: (product) => {
        const categories = getCategories(product);
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat, i) => (
              <span key={i} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                {cat}
              </span>
            ))}
            {categories.length > 2 && <span className="text-[9px] text-gray-400 dark:text-zinc-500">+{categories.length - 2}</span>}
          </div>
        );
      },
    },
    {
      header: "Variant & Price",
      render: (product) => {
        const activeVariants = getActiveVariants(product.product_variants);
        return (
          <div className="space-y-0.5">
            {activeVariants.slice(0, 2).map((v) => (
              <div key={v.id} className="text-[11px]">
                <span className="text-gray-500 dark:text-zinc-400">{v.desc || "Std"}:</span>{" "}
                <span className="font-semibold text-gray-800 dark:text-zinc-200">{formatPrice(v.price)}</span>
              </div>
            ))}
            {activeVariants.length > 2 && <div className="text-[10px] text-gray-400 dark:text-zinc-500">+{activeVariants.length - 2} variants</div>}
            {activeVariants.length === 0 && <div className="text-[10px] text-gray-300 dark:text-zinc-600 italic">No variant</div>}
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (product) => (
        <div className="flex flex-col items-start gap-1">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
          <Switch
            className="scale-75 origin-left"
            checked={product.status === "active"}
            onCheckedChange={() => onStatusChange(product.id, product.status)}
            disabled={product.status === "Non Stok" || !canEditProduct}
          />
        </div>
      ),
    },
    {
      header: "Date",
      render: (product) => (
        <div className="text-[10px]">
          <div className="text-gray-600 dark:text-zinc-400">{formatDate(product.created_at)}</div>
          {product.updated_at !== product.created_at && (
            <div className="text-gray-400 dark:text-zinc-500 italic">Upd: {formatDate(product.updated_at)}</div>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      className: "w-[80px] text-right",
      render: (product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 focus:ring-0 dark:text-zinc-400 dark:hover:text-zinc-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[140px] shadow-lg rounded-xl p-1 dark:bg-zinc-950 dark:border-zinc-800">
            <AccessControl permission="product_view">
              <DropdownMenuItem asChild>
                <Link href={`/product/${product.id}/view`} className="text-xs cursor-pointer rounded-lg">View</Link>
              </DropdownMenuItem>
            </AccessControl>
            
            <AccessControl permission="product_edit">
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/product/${product.id}/edit`} className="text-xs cursor-pointer rounded-lg">Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/product/${product.id}/variants`} className="text-xs cursor-pointer rounded-lg text-blue-600">Variants</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-1 my-1" />
              </>
            </AccessControl>

            <AccessControl permission="product_delete">
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="text-xs cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg"
              >
                Delete
              </DropdownMenuItem>
            </AccessControl>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <BaseDataTable
      columns={columns}
      data={products}
      emptyMessage="No products found"
    />
  );
};
