"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  X, 
  Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Type untuk variant
type Variant = {
  id: number;
  desc: string | null;
  price: number;
  created_at: string;
  product_variant_images: {
    id: number;
    image: string;
  }[];
  product: {
    id: number;
    name: string;
  };
};

export default function ProductVariantEditPage() {
  const params = useParams();
  const router = useRouter();
  
  // Safely access params
  const variantId = params?.variantId as string;
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variant, setVariant] = useState<Variant | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    desc: "",
    price: "",
    imageFile: null as File | null,
    imagePreview: "",
    removeImage: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (variantId) {
      fetchVariant();
    }
  }, [variantId]);

  const fetchVariant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/variants/${variantId}`);
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data varian");
      }
      
      const data = await response.json();
      setVariant(data);
      
      // Initialize form data
      setFormData({
        desc: data.desc || "",
        price: data.price.toString(),
        imageFile: null,
        imagePreview: data.product_variant_images?.[0]?.image || "",
        removeImage: false,
      });
    } catch (error) {
      console.error("Error fetching variant:", error);
      toast.error("Gagal memuat data varian");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setFormData({
      ...formData,
      imageFile: file,
      imagePreview: URL.createObjectURL(file), // Create new preview
      removeImage: false, // Ensure we are not removing the image if uploading new one
    });
  };

  const handleRemoveImage = () => {
    // Revoke object URL if it was created locally
    if (formData.imageFile && formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }

    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: "",
      removeImage: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.desc.trim() || !formData.price) {
      toast.error("Deskripsi dan harga harus diisi");
      return;
    }

    if (Number(formData.price) <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    try {
      setSaving(true);
      
      const submitData = new FormData();
      submitData.append("desc", formData.desc);
      submitData.append("price", formData.price);
      
      if (formData.imageFile) {
        submitData.append("image", formData.imageFile);
      }
      
      if (formData.removeImage) {
        submitData.append("removeImage", "true");
      }

      const response = await fetch(`/api/variants/${variantId}`, {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan perubahan");
      }

      toast.success("Varian berhasil diperbarui");
      
      // Delay redirect slightly to show toast
      setTimeout(() => {
        router.push(`/admin/product/${productId}/variants`);
      }, 1000);
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Varian tidak ditemukan
          </h3>
          <Link
            href={`/admin/product/${productId}/variants`}
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke daftar varian
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/product/${productId}/variants`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Daftar Varian
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Varian: {variant.product.name}
          </h1>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Varian</CardTitle>
              <CardDescription>
                Ubah detail varian produk ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi Varian</Label>
                <Input
                  id="desc"
                  placeholder="Contoh: Kopi Hitam Es, Large Size"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="15000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={saving}
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gambar Varian</CardTitle>
              <CardDescription>
                Upload gambar untuk varian ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {formData.imagePreview ? (
                  <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      disabled={saving}
                    />
                    <div className="p-4 bg-gray-100 rounded-full mb-3">
                      <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Klik untuk upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal 5MB
                    </p>
                  </div>
                )}
                
                {/* Fallback info when no image is selected */}
                {!formData.imagePreview && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 w-full p-2 bg-gray-50 rounded border">
                    <ImageIcon className="h-4 w-4" />
                    <span>Gambar default produk akan digunakan jika kosong</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
