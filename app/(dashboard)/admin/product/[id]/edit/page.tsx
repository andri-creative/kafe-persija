"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  Upload,
  X,
  Loader2,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { Field, FieldLabel } from "@/components/ui/field";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { useSession } from "next-auth/react";

// Type untuk variant
type VariantFormData = {
  id?: number;
  desc: string;
  price: string;
  stok: string;
  size: string;
  imageFiles: File[];
  imagePreviews: string[];
  existingImages: { id: number; url: string }[];
  removedImageIds: number[];
};

// Type untuk category
type Category = {
  id: number;
  name: string;
};

export default function EditProductPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    categories: [] as string[],
  });

  // Variants state
  const [variants, setVariants] = useState<VariantFormData[]>([
    {
      desc: "",
      price: "",
      stok: "0",
      size: "",
      imageFiles: [],
      imagePreviews: [],
      existingImages: [],
      removedImageIds: [],
    },
  ]);

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetchProductData();
      fetchCategories();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const product = await response.json();

      // Set form data
      setFormData({
        name: product.name,
        description: product.description || "",
        status: product.status,
        categories: product.product_category_trx.map(
          (trx: any) => trx.product_category.name,
        ),
      });

      // Set variants
      if (product.product_variants.length > 0) {
        const variantData = product.product_variants.map((variant: any) => ({
          id: variant.id,
          desc: variant.desc || "",
          price: variant.price.toString(),
          stok: variant.stok ? variant.stok.toString() : "0",
          size: variant.size || "",
          imageFiles: [],
          imagePreviews: [],
          existingImages: variant.product_variant_images.map((img: any) => ({
            id: img.id,
            url: img.image,
          })),
          removedImageIds: [],
        }));
        setVariants(variantData);
      } else {
        setVariants([
          {
            desc: "",
            price: "",
            stok: "0",
            size: "",
            imageFiles: [],
            imagePreviews: [],
            existingImages: [],
            removedImageIds: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategoriesList(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories;
      const newCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c) => c !== categoryName)
        : [...currentCategories, categoryName];
      return { ...prev, categories: newCategories };
    });
  };

  // Handle variant changes
  const handleVariantChange = (
    index: number,
    field: keyof VariantFormData,
    value: string,
  ) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    setVariants(newVariants);
  };

  // Handle image upload for variant
  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newVariants = [...variants];
    const currentVariant = newVariants[index];

    // Convert FileList to Array
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

    // Append files and previews
    const newImageFiles = [...currentVariant.imageFiles, ...validFiles];
    const newImagePreviews = [
      ...currentVariant.imagePreviews,
      ...validFiles.map(file => URL.createObjectURL(file))
    ];

    newVariants[index] = {
      ...currentVariant,
      imageFiles: newImageFiles,
      imagePreviews: newImagePreviews,
    };
    setVariants(newVariants);

    // Reset inputs
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  // Remove variant image
  const handleRemoveImage = (
    variantIndex: number,
    type: "new" | "existing",
    imageIndex: number,
  ) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    if (type === "new") {
      // Remove newly uploaded image
      URL.revokeObjectURL(variant.imagePreviews[imageIndex]);

      const newImageFiles = variant.imageFiles.filter((_, i) => i !== imageIndex);
      const newImagePreviews = variant.imagePreviews.filter((_, i) => i !== imageIndex);

      newVariants[variantIndex] = {
        ...variant,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews,
      };
    } else {
      // Remove existing image from UI and add to removal list
      const imageToRemove = variant.existingImages[imageIndex];
      const newExistingImages = variant.existingImages.filter((_, i) => i !== imageIndex);

      newVariants[variantIndex] = {
        ...variant,
        existingImages: newExistingImages,
        removedImageIds: [...variant.removedImageIds, imageToRemove.id],
      };
    }

    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      {
        desc: "",
        price: "",
        stok: "0",
        size: "",
        imageFiles: [],
        imagePreviews: [],
        existingImages: [],
        removedImageIds: [],
      },
      ...variants,
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      variants[index].imagePreviews.forEach(url => URL.revokeObjectURL(url));

      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  // Save product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Nama produk harus diisi");
      return;
    }

    if (formData.categories.length === 0) {
      toast.error("Pilih minimal satu kategori");
      return;
    }

    if (
      variants.some((v) => !v.desc.trim() || !v.price || Number(v.price) <= 0)
    ) {
      toast.error("Semua variant harus memiliki deskripsi dan harga valid");
      return;
    }

    try {
      setSaving(true);

      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("status", formData.status);

      // Append multiple categories
      formData.categories.forEach((category) => {
        formDataObj.append("categories", category);
      });

      // Add variants
      // Add variants
      variants.forEach((variant, index) => {
        formDataObj.append(`variants[${index}][id]`, variant.id?.toString() || "");
        formDataObj.append(`variants[${index}][desc]`, variant.desc);
        formDataObj.append(`variants[${index}][price]`, variant.price);
        formDataObj.append(`variants[${index}][stok]`, variant.stok);
        formDataObj.append(`variants[${index}][size]`, variant.size);

        // New images
        variant.imageFiles.forEach((file) => {
          formDataObj.append(`variants[${index}][images]`, file);
        });

        // Removed images (send as JSON string or multiple fields)
        if (variant.removedImageIds.length > 0) {
          // Option 1: Comma separated string
          formDataObj.append(`variants[${index}][removedImageIds]`, variant.removedImageIds.join(","));
        }
      });

      // Send update request
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formDataObj,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupdate produk");
      }

      toast.success("Produk berhasil diupdate!");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'updated', id: productId, product: result.data });

      // Clean up URL objects
      // Clean up URL objects
      variants.forEach((variant) => {
        variant.imagePreviews.forEach(url => URL.revokeObjectURL(url));
      });

      // Redirect back to products list
      setTimeout(() => {
        router.push("/admin/product");
      }, 1500);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupdate produk",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <ToastContainer />
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Memuat data produk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/product">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali
            </Link>
          </Button>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-2xl font-bold">Edit Produk</h1>
            <p className="text-gray-500 text-sm">Ubah informasi produk dan variannya</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/product">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button
            onClick={handleSave}
            className="cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN - PRODUCT INFO */}
          <Card className="lg:w-2/3">
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">
                  Nama Produk <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  placeholder="Contoh: Kopi Hitam"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                  disabled={saving}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">
                  Deskripsi <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Masukkan deskripsi produk..."
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  rows={3}
                  disabled={saving}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Field>
                  <FieldLabel htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFormChange("status", value)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                      <SelectItem value="Non Stok">Non Stok</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </FieldLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                        disabled={saving}
                      >
                        {formData.categories.length > 0
                          ? formData.categories.join(", ")
                          : "Pilih kategori"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                      <DropdownMenuLabel>Kategori Produk</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {categoriesList.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.id}
                          checked={formData.categories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                        >
                          {category.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN - VARIANTS */}
          <Card className="lg:w-1/3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Varian Produk</CardTitle>
                <p className="text-sm text-gray-500">Minimal 1 varian</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={addVariant}
                className="cursor-pointer"
                disabled={saving}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <Label className="font-medium">
                        Varian {index + 1} {variant.id && `(ID: ${variant.id})`}
                      </Label>
                    </div>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>
                        Deskripsi Varian <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Contoh: Kopi Hitam Es"
                        value={variant.desc}
                        onChange={(e) =>
                          handleVariantChange(index, "desc", e.target.value)
                        }
                        required
                        disabled={saving}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>
                          Harga (Rp) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="15000"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          required
                          min="0"
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Stok <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.stok}
                          onChange={(e) =>
                            handleVariantChange(index, "stok", e.target.value)
                          }
                          required
                          min="0"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Size <span className="text-gray-400">(Opsional)</span></Label>
                      <Input
                        placeholder="Contoh: Large, 500ml"
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gambar (Opsional - Bisa banyak)</Label>
                      <div className="space-y-4">
                        {/* Image Grid */}
                        {(variant.existingImages.length > 0 || variant.imagePreviews.length > 0) && (
                          <div className="grid grid-cols-3 gap-2">
                            {/* Existing Images */}
                            {variant.existingImages.map((img, imgIndex) => (
                              <div key={`existing-${imgIndex}`} className="relative group">
                                <div className="border rounded-lg overflow-hidden h-24 w-full">
                                  <Image
                                    src={getVariantImageUrl(img.url)}
                                    alt={`Existing ${imgIndex}`}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveImage(index, "existing", imgIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}

                            {/* New Images */}
                            {variant.imagePreviews.map((preview, imgIndex) => (
                              <div key={`new-${imgIndex}`} className="relative group">
                                <div className="border rounded-lg overflow-hidden h-24 w-full">
                                  <img
                                    src={preview}
                                    alt={`New ${imgIndex}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveImage(index, "new", imgIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => fileInputRefs.current[index]?.click()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[index] = el;
                            }}
                            onChange={(e) => handleImageUpload(index, e)}
                            disabled={saving}
                          />
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            {(variant.existingImages.length > 0 || variant.imagePreviews.length > 0)
                              ? "Tambah Gambar Lain"
                              : "Upload Gambar"}
                          </p>
                          <p className="text-xs text-gray-500">Max 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Info tambahan jika belum ada variant */}
              {variants.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Belum ada varian</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="cursor-pointer"
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Varian Pertama
                  </Button>
                </div>
              )}

              {/* Total harga variant */}
              {variants.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Variant:</span>
                    <span className="font-bold">{variants.length} varian</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Harga Terendah:</span>
                    <span className="font-bold">
                      Rp{" "}
                      {Math.min(
                        ...variants.map((v) => Number(v.price) || 0),
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Harga Tertinggi:</span>
                    <span className="font-bold">
                      Rp{" "}
                      {Math.max(
                        ...variants.map((v) => Number(v.price) || 0),
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
