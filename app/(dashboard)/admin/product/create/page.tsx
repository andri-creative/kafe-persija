"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Package,
  Upload,
  X,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

// Type untuk variant
type VariantFormData = {
  id?: number;
  desc: string;
  price: string;
  imageFile?: File | null;
  imagePreview?: string;
};

export default function CreateProductPage() {
  // State untuk form product
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<
    { id: number; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategoriesList(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCategories();
  }, []);

  // State untuk variants
  const [variants, setVariants] = useState<VariantFormData[]>([
    { desc: "", price: "" },
  ]);

  // Ref untuk file input
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handler untuk variant text fields
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

  // Handler untuk upload gambar
  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan (JPG, PNG, GIF)");
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    };
    setVariants(newVariants);
  };

  // Hapus gambar
  const handleRemoveImage = (index: number) => {
    const newVariants = [...variants];
    if (newVariants[index].imagePreview) {
      URL.revokeObjectURL(newVariants[index].imagePreview!);
    }
    newVariants[index] = {
      ...newVariants[index],
      imageFile: null,
      imagePreview: undefined,
    };
    setVariants(newVariants);

    // Reset file input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  // Tambah variant baru
  const addVariant = () => {
    setVariants([...variants, { desc: "", price: "" }]);
    fileInputRefs.current.push(null);
  };

  // Hapus variant
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      // Clean up URL object
      if (variants[index].imagePreview) {
        URL.revokeObjectURL(variants[index].imagePreview);
      }

      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      fileInputRefs.current = fileInputRefs.current.filter(
        (_, i) => i !== index,
      );
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validasi
    if (!productName.trim()) {
      toast.error("Nama produk harus diisi");
      setIsSubmitting(false);
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Pilih minimal satu kategori produk");
      setIsSubmitting(false);
      return;
    }

    if (
      variants.some((v) => !v.desc.trim() || !v.price || Number(v.price) <= 0)
    ) {
      toast.error("Semua variant harus memiliki deskripsi dan harga valid");
      setIsSubmitting(false);
      return;
    }

    try {
      // Buat FormData
      const formData = new FormData();

      // Data produk
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("status", status);
      
      // Append multiple categories
      selectedCategories.forEach((category) => {
        formData.append("categories", category);
      });

      // Data variants
      variants.forEach((variant, index) => {
        formData.append(`variants[${index}][desc]`, variant.desc);
        formData.append(`variants[${index}][price]`, variant.price);
        if (variant.imageFile) {
          formData.append(`variants[${index}][image]`, variant.imageFile);
        }
      });

      console.log("Mengirim data ke API...");

      // Kirim ke API
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Gagal membuat produk (${response.status})`,
        );
      }

      toast.success("Produk berhasil dibuat!");

      // Clean up semua URL object
      variants.forEach((variant) => {
        if (variant.imagePreview) {
          URL.revokeObjectURL(variant.imagePreview);
        }
      });

      // Reset form setelah submit
      setProductName("");
      setDescription("");
      setStatus("active");
      setSelectedCategories([]);
      setVariants([{ desc: "", price: "" }]);
      fileInputRefs.current = [null];

      // Redirect ke halaman list product setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "/admin/product";
      }, 1500);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat produk",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
            <p className="text-gray-500">Isi informasi produk dan variannya</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/product">
              <Button variant="outline">Batal</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Produk"
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN - PRODUCT INFO */}
            <Card className="lg:w-2/3">
              <CardHeader>
                <CardTitle>Informasi Produk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="product-name">
                    Nama Produk <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="product-name"
                    placeholder="Contoh: Kopi Hitam"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <FieldDescription>
                    Nama produk yang akan ditampilkan
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="product-description">
                    Deskripsi
                  </FieldLabel>
                  <Textarea
                    id="product-description"
                    placeholder="Masukkan deskripsi produk..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <FieldDescription>
                    Deskripsi detail tentang produk
                  </FieldDescription>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="product-status">
                      Status <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status Produk</SelectLabel>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="Non Stok">Non Stok</SelectItem>
                          <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="product-category">
                      Kategori <span className="text-red-500">*</span>
                    </FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-normal"
                        >
                          {selectedCategories.length > 0
                            ? selectedCategories.join(", ")
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
                            checked={selectedCategories.includes(category.name)}
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
                          Varian {index + 1}
                        </Label>
                      </div>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Field>
                        <FieldLabel>
                          Deskripsi Varian{" "}
                          <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          placeholder="Contoh: Kopi Hitam Es"
                          value={variant.desc}
                          onChange={(e) =>
                            handleVariantChange(index, "desc", e.target.value)
                          }
                          required
                        />
                        <FieldDescription>
                          Contoh: Kopi Hitam Panas, Teh Tarik Es, Large Size
                        </FieldDescription>
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel>
                            Harga (Rp) <span className="text-red-500">*</span>
                          </FieldLabel>
                          <Input
                            type="number"
                            placeholder="15000"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "price",
                                e.target.value,
                              )
                            }
                            required
                            min="0"
                          />
                        </Field>

                        <Field>
                          <FieldLabel>Gambar (Opsional)</FieldLabel>
                          <div className="space-y-2">
                            {variant.imagePreview ? (
                              <div className="relative">
                                <div className="border rounded-lg overflow-hidden">
                                  <img
                                    src={variant.imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 p-0"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() =>
                                  fileInputRefs.current[index]?.click()
                                }
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  ref={(el) => {
                                    fileInputRefs.current[index] = el;
                                  }}
                                  onChange={(e) => handleImageUpload(index, e)}
                                />
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                  Upload Gambar
                                </p>
                                <p className="text-xs text-gray-500">
                                  JPG, PNG, GIF • Max 5MB
                                </p>
                              </div>
                            )}
                          </div>
                        </Field>
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
                      <span className="font-bold">
                        {variants.length} varian
                      </span>
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
    </>
  );
}
