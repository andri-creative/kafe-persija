"use client";

import { Package, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";
import { AccessControl } from "@/components/rbac/AccessControl";

interface ProductVariantHeaderProps {
  productName: string;
  description: string | null;
  categories: { product_category: { name: string } }[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
}

export function ProductVariantHeader({
  productName,
  description,
  categories,
  showAddForm,
  setShowAddForm,
}: ProductVariantHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <ButtonsComponentsBack backUrl="/product" title="Product" showText />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Product Variants: {productName}
          </h1>
          {description && (
            <p className="text-gray-600 mt-1 text-xs">{description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((trx, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded"
              >
                {trx.product_category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AccessControl permission="product_edit">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 h-8 text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? "Cancel" : "Add Variant"}
          </Button>
        </div>
      </AccessControl>
    </div>
  );
}
