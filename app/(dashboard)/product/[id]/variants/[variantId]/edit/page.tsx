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
  Image as ImageIcon,
  ChevronLeft
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { useSession } from "next-auth/react";

// Type untuk variant
type Variant = {
  id: number;
  desc: string | null;
  price: number;
  stok: number | null;
  size: string | null;
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
  const { data: session } = useSession();
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
    stok: "",
    size: "",
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
    existingImages: [] as { id: number; image: string }[],
    removedImageIds: [] as number[],
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
        stok: data.stok?.toString() || "0",
        size: data.size || "",
        imageFiles: [],
        imagePreviews: [],
        existingImages: data.product_variant_images || [],
        removedImageIds: [],
      });
    } catch (error) {
      console.error("Error fetching variant:", error);
      toast.error("Gagal memuat data varian");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar (max 5MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles],
      imagePreviews: [...prev.imagePreviews, ...validFiles.map(file => URL.createObjectURL(file))]
    }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (type: "new" | "existing", index: number) => {
    if (type === "new") {
      URL.revokeObjectURL(formData.imagePreviews[index]);
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== index),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
      }));
    } else {
      const imageToRemove = formData.existingImages[index];
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        removedImageIds: [...prev.removedImageIds, imageToRemove.id]
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
      submitData.append("stok", formData.stok);
      submitData.append("size", formData.size);

      // New images
      formData.imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      // Removed images
      if (formData.removedImageIds.length > 0) {
        submitData.append("removedImageIds", formData.removedImageIds.join(","));
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

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_updated', productId, variantId, data: result.data });

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

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <ButtonsComponentsBack backUrl={`/admin/product/${productId}/variants`} title="Varian" showText />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Edit Varian: {variant.product.name}
            </h1>
          </div>
        </div>

        <ButtonsComponentsSave
          title="Perubahan"
          isLoading={saving}
          onClick={() => handleSubmit()}
          className="h-8 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informasi Varian</CardTitle>
              <CardDescription className="text-xs">
                Ubah detail varian produk ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-[10px]">Deskripsi Varian</Label>
                <Input
                  id="desc"
                  placeholder="Contoh: Kopi Hitam Es, Large Size"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  disabled={saving}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[10px]">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="15000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={saving}
                  min="0"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stok" className="text-[10px]">Stok</Label>
                <Input
                  id="stok"
                  type="number"
                  placeholder="0"
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                  disabled={saving}
                  min="0"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="size" className="text-[10px]">Size (Opsional)</Label>
                <Input
                  id="size"
                  placeholder="Contoh: Large, 350ml"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  disabled={saving}
                  className="h-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gambar Varian</CardTitle>
              <CardDescription className="text-xs">
                Upload gambar untuk varian ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Existing Images */}
                {(formData.existingImages.length > 0 || formData.imagePreviews.length > 0) && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50 group">
                        <img
                          src={getVariantImageUrl(img.image)}
                          alt="Existing"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage("existing", index)}
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square border rounded-lg overflow-hidden bg-gray-50 group">
                        <img
                          src={preview}
                          alt="New Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage("new", index)}
                          disabled={saving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    disabled={saving}
                  />
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Upload className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">
                    {(formData.existingImages.length > 0 || formData.imagePreviews.length > 0) ? "Tambah Gambar" : "Upload Gambar"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Maks. 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
