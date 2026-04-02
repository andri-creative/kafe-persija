"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryOption } from "../types";
import { 
  ProductInputField, 
  ProductTextareaField, 
  ProductSelectField, 
  ProductCategoryMultiSelect 
} from "./ProductFormFields";

interface ProductInfoSectionProps {
  productName: string;
  setProductName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  selectedCategories: string[];
  toggleCategory: (name: string) => void;
  categoriesList: CategoryOption[];
  isSaving?: boolean;
}

export function ProductInfoSection({
  productName,
  setProductName,
  description,
  setDescription,
  status,
  setStatus,
  selectedCategories,
  toggleCategory,
  categoriesList,
  isSaving = false,
}: ProductInfoSectionProps) {
  return (
    <Card className="lg:w-2/3 border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">
          Product Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <ProductInputField
          label="Product Name"
          placeholder="Enter product name (e.g., Kopi Susu Aren)"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          disabled={isSaving}
          description="This name will appear on the cashier menu and receipt"
        />

        <ProductTextareaField
          label="Product Description"
          placeholder="Tell us about the taste or ingredients of this menu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isSaving}
          description="Optional: Description helps staff understand the product"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductSelectField
            label="Availability Status"
            value={status}
            onValueChange={setStatus}
            required
            disabled={isSaving}
            options={[
              { value: "active", label: "🟢 Active (Available)" },
              { value: "Non Stok", label: "🟡 Non Stok (Out of Stock)" },
              { value: "inactive", label: "🔴 Inactive (Hidden)" },
            ]}
          />

          <ProductCategoryMultiSelect
            label=" Product Category"
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            categoriesList={categoriesList}
            required
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
