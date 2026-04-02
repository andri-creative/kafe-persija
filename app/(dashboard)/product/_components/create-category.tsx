"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { ProductInputField } from "./ProductFormFields";

export default function CreateCategory({
  onCreated,
}: {
  onCreated: (category: any) => void;
}) {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama kategori harus diisi");
      return;
    }

    if (!imageFile) {
      toast.error("Pilih gambar kategory terlebih dahulu");
      return;
    }

    setUploading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("image", imageFile);
      submitFormData.append("created_by", session?.user?.id || "1");

      const response = await fetch("/api/categories", {
        method: "POST",
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Kategori berhasil dibuat!");
        onCreated(result.data);
        setFormData({ name: "" });
        setImagePreview(null);
        setImageFile(null);
      } else {
        toast.error(result.error || "Gagal membuat kategori");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <ProductInputField
            label="Name Category"
            placeholder="Cth: Makanan Berat"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={uploading}
            description="Name category product/menu will be created"
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Image Category <span className="text-red-500">*</span>
            </label>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 hover:border-indigo-400 bg-white"
                } ${uploading ? "cursor-wait opacity-60" : "cursor-pointer"} shadow-sm`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileChange({ target: { files: [file] } } as any);
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest"
                  >
                    DELETE IMAGE
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Drag / Drop Image</p>
                    <p className="text-[10px] text-slate-400 font-medium">or click to browse</p>
                    <p className="text-[9px] text-slate-300 uppercase tracking-tight">JPG, PNG, WebP • Maks 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={uploading || !formData.name || !imageFile}
          className={`w-full h-10 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg ${uploading || !formData.name || !imageFile
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> PROCESSING...
            </span>
          ) : "CREATE CATEGORY"}
        </Button>
      </form>
    </div>
  );
}
