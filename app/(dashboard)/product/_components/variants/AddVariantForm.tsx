"use client";

import { X, Upload, Plus, Loader2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

interface AddVariantFormProps {
  newVariant: {
    desc: string;
    price: string;
    stok: string;
    size: string;
    imageFile: File | null;
    imagePreview: string;
  };
  setNewVariant: (variant: any) => void;
  addingVariant: boolean;
  onAdd: () => void;
  onCancel: () => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
}

export function AddVariantForm({
  newVariant,
  setNewVariant,
  addingVariant,
  onAdd,
  onCancel,
  handleImageUpload,
  handleRemoveImage,
}: AddVariantFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="border-none shadow-xl bg-white/90 dark:bg-zinc-900/90 overflow-hidden ring-2 ring-blue-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
      <CardHeader className="bg-slate-50/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1">
          Add New Variant
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
          Add a new variation for this product
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Variant Description *</Label>
            <Input
              id="desc"
              placeholder="e.g., Black Coffee Ice, Large Size"
              value={newVariant.desc}
              onChange={(e) =>
                setNewVariant({ ...newVariant, desc: e.target.value })
              }
              disabled={addingVariant}
              className="h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price (Rp) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="15000"
              value={newVariant.price}
              onChange={(e) =>
                setNewVariant({ ...newVariant, price: e.target.value })
              }
              disabled={addingVariant}
              min="0"
              className="h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stok" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stock</Label>
            <Input
              id="stok"
              type="number"
              placeholder="0"
              value={newVariant.stok}
              onChange={(e) =>
                setNewVariant({ ...newVariant, stok: e.target.value })
              }
              disabled={addingVariant}
              min="0"
              className="h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Size (Optional)</Label>
            <Input
              id="size"
              placeholder="e.g., Large, 350ml"
              value={newVariant.size}
              onChange={(e) =>
                setNewVariant({ ...newVariant, size: e.target.value })
              }
              disabled={addingVariant}
              className="h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Variant Images (Optional)</Label>
          <div className="flex gap-4">
            {newVariant.imagePreview ? (
              <div className="relative group">
                <div className="border-2 border-white shadow-xl rounded-2xl overflow-hidden w-28 h-28 transform transition-transform group-hover:scale-105">
                  <img
                    src={newVariant.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-all duration-200"
                  onClick={handleRemoveImage}
                  disabled={addingVariant}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 hover:border-blue-400 transition-all flex flex-col items-center justify-center w-28 h-28 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={addingVariant}
                />
                <Upload className="h-6 w-6 text-slate-300 group-hover:text-blue-500 transition-colors mb-1" />
                <p className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 uppercase">Upload</p>
              </div>
            )}
            <div className="flex flex-col justify-center gap-1">
              <p className="text-[10px] font-black text-slate-800 dark:text-zinc-300">Format: JPG, PNG, GIF</p>
              <p className="text-[10px] font-bold text-slate-400">Max size 5MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-50 dark:border-zinc-800">
          <Button
            onClick={onAdd}
            disabled={addingVariant || !newVariant.desc || !newVariant.price}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/50 transition-all hover:scale-105 active:scale-95 px-8 h-10 text-xs font-black uppercase tracking-widest rounded-xl"
          >
            {addingVariant ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Save Variant
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={addingVariant}
            className="h-10 px-6 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
