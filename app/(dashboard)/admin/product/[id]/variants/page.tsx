"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
import { useRef } from "react";
import { Switch } from "@/components/ui/switch";
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
  status: boolean;
  created_at: string;
  product_variant_images: {
    id: number;
    image: string;
  }[];
};

// Type untuk product
type Product = {
  id: number;
  name: string;
  description: string | null;
  product_category_trx: {
    product_category: {
      name: string;
    };
  }[];
};

export default function ProductVariantsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);

  // State untuk form tambah variant
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    desc: "",
    price: "",
    stok: "",
    size: "",
    imageFile: null as File | null,
    imagePreview: "",
  });
  const [addingVariant, setAddingVariant] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productId) {
      fetchProductAndVariants();
    }
  }, [productId]);

  const fetchProductAndVariants = async () => {
    try {
      setLoading(true);

      // Fetch product details
      const productRes = await fetch(`/api/products/${productId}`);
      if (!productRes.ok) throw new Error("Failed to fetch product");
      const productData = await productRes.json();

      setProduct(productData);

      // Fetch variants
      const variantsRes = await fetch(`/api/products/${productId}/variants`);
      const variantsData = await variantsRes.json();

      setVariants(variantsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data produk dan varian");
    } finally {
      setLoading(false);
    }
  };

  // Format harga
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle delete variant
  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus varian ini?")) return;

    try {
      setDeletingId(variantId);
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal menghapus varian");
      }

      setVariants(variants.filter((v) => v.id !== variantId));
      toast.success("Varian berhasil dihapus");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_deleted', productId, variantId });
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus varian",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Handle image upload
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

    setNewVariant({
      ...newVariant,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  // Remove image
  const handleRemoveImage = () => {
    if (newVariant.imagePreview) {
      URL.revokeObjectURL(newVariant.imagePreview);
    }
    setNewVariant({
      ...newVariant,
      imageFile: null,
      imagePreview: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add new variant
  const handleAddVariant = async () => {
    if (!newVariant.desc.trim() || !newVariant.price) {
      toast.error("Deskripsi dan harga harus diisi");
      return;
    }

    if (Number(newVariant.price) <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    try {
      setAddingVariant(true);

      const formData = new FormData();
      formData.append("desc", newVariant.desc);
      formData.append("price", newVariant.price);
      formData.append("stok", newVariant.stok || "0");
      formData.append("size", newVariant.size || "");
      if (newVariant.imageFile) {
        formData.append("image", newVariant.imageFile);
      }

      const response = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("🚀 ~ handleAddVariant ~ result:", result)

      if (!response.ok) {
        throw new Error(result.error || "Gagal menambahkan varian");
      }

      // Add new variant to list
      setVariants([result.data, ...variants]);
      toast.success("Varian berhasil ditambahkan");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_created', productId, variant: result.data });

      // Reset form
      setNewVariant({
        desc: "",
        price: "",
        stok: "",
        size: "",
        imageFile: null,
        imagePreview: "",
      });
      setShowAddForm(false);

      // Clean up URL
      if (newVariant.imagePreview) {
        URL.revokeObjectURL(newVariant.imagePreview);
      }
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan varian",
      );
    } finally {
      setAddingVariant(false);
    }
  };

  // Edit variant (redirect to edit page)
  const handleEditVariant = (variantId: number) => {
    router.push(`/admin/product/${productId}/variants/${variantId}/edit`);
  };

  const handleToggleStatus = async (variantId: number, checked: boolean) => {
    // Optimistic update
    const previousVariants = [...variants];
    const newVariants = variants.map((v) =>
      v.id === variantId ? { ...v, status: !checked } : v
    );
    setVariants(newVariants);

    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status varian berhasil diperbarui");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_status_updated', productId, variantId, status: !checked });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status");
      setVariants(previousVariants);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <ToastContainer />
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Memuat data varian...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <ToastContainer />
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Produk tidak ditemukan
          </h3>
          <Link
            href="/admin/product"
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke daftar produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/product">
              <ChevronLeft size={20} className="mr-1" />
              Kembali
            </Link>
          </Button>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Varian Produk: {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {product.product_category_trx.map((trx, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {trx.product_category.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" />
            Tambah Varian
          </Button>
        </div>
      </div>

      {/* ADD VARIANT FORM */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Varian Baru</CardTitle>
            <CardDescription>
              Tambah varian baru untuk produk ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi Varian *</Label>
                <Input
                  id="desc"
                  placeholder="Contoh: Kopi Hitam Es, Large Size"
                  value={newVariant.desc}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, desc: e.target.value })
                  }
                  disabled={addingVariant}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp) *</Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stok">Stok</Label>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (Opsional)</Label>
                <Input
                  id="size"
                  placeholder="Contoh: Large, 350ml"
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, size: e.target.value })
                  }
                  disabled={addingVariant}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gambar (Opsional)</Label>
              {newVariant.imagePreview ? (
                <div className="relative">
                  <div className="border rounded-lg overflow-hidden w-32 h-32">
                    <img
                      src={newVariant.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={handleRemoveImage}
                    disabled={addingVariant}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors w-32"
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
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload</p>
                </div>
              )}
              <p className="text-xs text-gray-500">JPG, PNG, GIF • Max 5MB</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddVariant}
                disabled={
                  addingVariant || !newVariant.desc || !newVariant.price
                }
              >
                {addingVariant ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Varian"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={addingVariant}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VARIANTS LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Varian</CardTitle>
          <CardDescription>
            {variants.length} varian ditemukan untuk produk ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada varian untuk produk ini</p>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Varian Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Varian
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Stok
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Gambar
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Harga
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          {variant.desc || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Added: {formatDate(variant.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {variant.size || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {variant.stok || 0}
                      </td>
                      <td className="py-4 px-4">
                        {variant.product_variant_images.length > 0 ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {variant.product_variant_images.slice(0, 3).map((img) => (
                              <div key={img.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-gray-100">
                                <img
                                  src={getVariantImageUrl(img.image)}
                                  alt="Variant"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            {variant.product_variant_images.length > 3 && (
                              <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 text-xs font-medium text-gray-600">
                                +{variant.product_variant_images.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold">
                          {formatPrice(variant.price)}
                        </div>
                      </td>
                      <td className="py-4 px-4 flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium max-w-fit justify-center ${variant.status === false
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {variant.status === false ? "Aktif" : "Nonaktif"}
                        </span>
                        <Switch
                          checked={variant.status === false}
                          onCheckedChange={(checked) => handleToggleStatus(variant.id, checked)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVariant(variant.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.id)}
                            disabled={deletingId === variant.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            {deletingId === variant.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SUMMARY */}
      {variants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">
                {variants.length}
              </div>
              <div className="text-gray-600">Total Varian</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(Math.min(...variants.map((v) => v.price)))}
              </div>
              <div className="text-gray-600">Harga Terendah</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(Math.max(...variants.map((v) => v.price)))}
              </div>
              <div className="text-gray-600">Harga Tertinggi</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
