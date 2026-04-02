"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProductInputField } from "../ProductFormFields";

interface VariantEditFormProps {
  formData: {
    desc: string;
    price: string;
    stok: string;
    size: string;
  };
  setFormData: (data: any) => void;
  saving: boolean;
}

export function VariantEditForm({ formData, setFormData, saving }: VariantEditFormProps) {
  return (
    <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1">
          Variant Information
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
          Configure current specification and pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <ProductInputField
          label="Variant Description"
          placeholder="e.g., Black Coffee Ice, Large Size"
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          disabled={saving}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductInputField
            label="Price (Rp)"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            disabled={saving}
            min="0"
            required
          />
          <ProductInputField
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={formData.stok}
            onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
            disabled={saving}
            min="0"
          />
        </div>

        <ProductInputField
          label="Size Label (Optional)"
          placeholder="e.g., Large, XL, 500ml"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          disabled={saving}
        />
      </CardContent>
    </Card>
  );
}
