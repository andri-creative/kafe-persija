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
          Informasi Utama Produk
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <ProductInputField
          label="Nama Produk"
          placeholder="Masukkan nama menu (cth: Kopi Susu Aren)"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          disabled={isSaving}
          description="Nama ini akan tampil di menu kasir dan struk"
        />

        <ProductTextareaField
          label="Deskripsi Produk"
          placeholder="Ceritakan tentang rasa atau bahan menu ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isSaving}
          description="Opsional: Deskripsi membantu staf memahami produk"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductSelectField
            label="Status Ketersediaan"
            value={status}
            onValueChange={setStatus}
            required
            disabled={isSaving}
            options={[
              { value: "active", label: "🟢 Aktif (Tersedia)" },
              { value: "Non Stok", label: "🟡 Non Stok (Habis)" },
              { value: "inactive", label: "🔴 Nonaktif (Sembunyikan)" },
            ]}
          />

          <ProductCategoryMultiSelect
            label="Kategori Menu"
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
