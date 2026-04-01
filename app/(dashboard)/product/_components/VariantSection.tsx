"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Package,
  Upload,
  X,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { ProductVariantFormData as VariantFormData } from "../types";
import { ProductInputField } from "./ProductFormFields";

interface VariantSectionProps {
  variants: VariantFormData[];
  addVariant: () => void;
  removeVariant: (index: number) => void;
  handleVariantChange: (index: number, field: keyof VariantFormData, value: string) => void;
  handleImageUpload: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (variantIndex: number, type: "new" | "existing", imageIndex: number) => void;
  fileInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isSaving?: boolean;
}

export function VariantSection({
  variants,
  addVariant,
  removeVariant,
  handleVariantChange,
  handleImageUpload,
  handleRemoveImage,
  fileInputRefs,
  isSaving = false,
}: VariantSectionProps) {
  return (
    <Card className="lg:w-1/3 border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Varian Harga
          </CardTitle>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Minimal 1 varian</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addVariant}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg h-7 text-[10px] px-3 font-bold rounded-lg transition-all"
        >
          <Plus className="h-3 w-3 mr-1" />
          TAMBAH
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {variants.map((variant, index) => (
          <div key={index} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg">
                  <Package className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <Label className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  Varian #{index + 1} {variant.id && <span className="text-indigo-400 font-bold ml-1">[{variant.id}]</span>}
                </Label>
              </div>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full"
                  disabled={isSaving}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <ProductInputField
                label="Deskripsi Varian"
                placeholder="Cth: Ukuran Large / Ekstra Panas"
                value={variant.desc}
                onChange={(e) => handleVariantChange(index, "desc", e.target.value)}
                required
                disabled={isSaving}
              />

              <div className="grid grid-cols-2 gap-4">
                <ProductInputField
                  label="Harga (Rp)"
                  type="number"
                  placeholder="0"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  required
                  min="0"
                  disabled={isSaving}
                />
                <ProductInputField
                  label="Stok"
                  type="number"
                  placeholder="0"
                  value={variant.stok}
                  onChange={(e) => handleVariantChange(index, "stok", e.target.value)}
                  required
                  min="0"
                  disabled={isSaving}
                />
              </div>

              <ProductInputField
                label="Ukuran (Size)"
                placeholder="Cth: 500ml / L"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                disabled={isSaving}
              />

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Foto Varian</Label>
                <div className="grid grid-cols-3 gap-2">
                  {variant.existingImages.map((img, imgIndex) => (
                    <div key={`existing-${imgIndex}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md group">
                      <Image
                        src={getVariantImageUrl(img.url)}
                        alt={`Existing ${imgIndex}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 rounded-full scale-0 group-hover:scale-100 transition-all shadow-lg"
                        onClick={() => handleRemoveImage(index, "existing", imgIndex)}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {variant.imagePreviews.map((preview, imgIndex) => (
                    <div key={`new-${imgIndex}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md group">
                      <img src={preview} alt={`New ${imgIndex}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 rounded-full scale-0 group-hover:scale-100 transition-all shadow-lg"
                        onClick={() => handleRemoveImage(index, "new", imgIndex)}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  <div
                    className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 border-slate-200 hover:border-indigo-400 group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSaving && fileInputRefs.current[index]?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      onChange={(e) => handleImageUpload(index, e)}
                      disabled={isSaving}
                    />
                    <Upload className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-tighter">Tambah Foto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {variants.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-3xl bg-slate-50 border-slate-200/50">
            <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-4">Belum Ada Varian</p>
            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
              className="text-[10px] font-black tracking-widest px-6 rounded-full"
              disabled={isSaving}
            >
              + TAMBAH VARIAN
            </Button>
          </div>
        )}

        {variants.length > 0 && (
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 space-y-2 mt-4 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Varian:</span>
              <span className="text-xs font-black text-indigo-700">{variants.length} SKU</span>
            </div>
            <div className="flex justify-between items-center border-t border-indigo-100/30 pt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimasi Harga:</span>
              <span className="text-xs font-black text-slate-900">
                Rp {Math.min(...variants.map((v) => Number(v.price) || 0)).toLocaleString("id-ID")} - 
                Rp {Math.max(...variants.map((v) => Number(v.price) || 0)).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
