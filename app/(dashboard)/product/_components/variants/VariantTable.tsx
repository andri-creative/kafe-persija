"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch as UISwitch } from "@/components/ui/switch";
import ActionsButtons from "@/components/acctions-buttons";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { BaseDataTable, Column } from "../BaseDataTable";

import { AccessControl } from "@/components/rbac/AccessControl";
import { Badge } from "@/components/ui/badge";

interface Variant {
  id: number;
  desc: string | null;
  price: number;
  stok: number | null;
  size: string | null;
  status: boolean;
  created_at: string;
  product_variant_images: {
    id: number;
    image: string;
  }[];
}

interface VariantTableProps {
  variants: Variant[];
  productId: string;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, checked: boolean) => void;
  onShowAddForm: () => void;
}

export function VariantTable({
  variants,
  productId,
  onDelete,
  onEdit,
  onToggleStatus,
  onShowAddForm,
}: VariantTableProps) {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const columns: Column<Variant>[] = [
    {
      header: "Variant Info",
      render: (variant) => (
        <div className="py-1">
          <div className="font-bold text-slate-800 dark:text-zinc-200">
            {variant.desc || "Untitled Variant"}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium text-nowrap">
            Added on {formatDate(variant.created_at)}
          </div>
        </div>
      ),
    },
    {
      header: "Size & Stock",
      render: (variant) => (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Size: <span className="text-slate-800 dark:text-zinc-300 font-black">{variant.size || "N/A"}</span></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Stock: <span className="text-slate-800 dark:text-zinc-300 font-black">{variant.stok || 0} unit</span></span>
        </div>
      ),
    },
    {
      header: "Images",
      render: (variant) => (
        <div className="flex items-center">
          {variant.product_variant_images.length > 0 ? (
            <div className="flex -space-x-3 overflow-hidden">
              {variant.product_variant_images.slice(0, 3).map((img) => (
                <div key={img.id} className="inline-block h-10 w-10 rounded-xl ring-2 ring-white dark:ring-zinc-900 overflow-hidden bg-slate-100 shadow-sm transition-transform hover:scale-110 hover:z-10">
                  <img
                    src={getVariantImageUrl(img.image)}
                    alt="Variant"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {variant.product_variant_images.length > 3 && (
                <div className="flex items-center justify-center h-10 w-10 rounded-xl ring-2 ring-white dark:ring-zinc-900 bg-indigo-50 text-[10px] font-black text-indigo-600 shadow-sm">
                  +{variant.product_variant_images.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-300 italic text-[10px] font-bold uppercase">
              No images
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Price",
      render: (variant) => (
        <div className="font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg inline-block text-xs">
          {formatPrice(variant.price)}
        </div>
      ),
    },
    {
      header: "Status",
      render: (variant) => (
        <div className="flex flex-col gap-2">
          <AccessControl 
            permission="product_edit" 
            fallback={
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest max-w-fit justify-center shadow-sm ${
                  variant.status === false
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                }`}
              >
                {variant.status === false ? "Active" : "Inactive"}
              </div>
            }
          >
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest max-w-fit justify-center shadow-sm ${
                variant.status === false
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
              }`}
            >
              {variant.status === false ? "Active" : "Inactive"}
            </div>
            <UISwitch
              checked={variant.status === false}
              onCheckedChange={(checked) => onToggleStatus(variant.id, checked)}
              className="scale-75 origin-left"
            />
          </AccessControl>
        </div>
      ),
    },
    {
      header: "Action",
      className: "text-right pr-6",
      render: (variant) => (
        <AccessControl permission="product_edit">
          <div className="flex justify-end">
            <ActionsButtons
              editUrl={`/product/${productId}/variants/${variant.id}/edit`}
              onDelete={() => onDelete(variant.id)}
              showView={false}
            />
          </div>
        </AccessControl>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">Variant List</CardTitle>
        <CardDescription className="text-xs">
          {variants.length} variants found for this product
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <BaseDataTable
          columns={columns}
          data={variants}
          emptyMessage="No variants found for this product"
        />
        {variants.length === 0 && (
          <div className="text-center py-6">
            <Button
              onClick={onShowAddForm}
              variant="outline"
              className="h-8 text-xs font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Add Your First Variant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
