"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
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
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
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
};

export default function CreateProductPage() {
  const { data: session } = useSession();
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
    {
      desc: "",
      price: "",
      stok: "0",
      size: "",
      imageFiles: [],
      imagePreviews: [],
    },
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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newVariants = [...variants];
    const currentVariant = newVariants[index];

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validasi
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar`);
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} melebihi 5MB`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Append files and previews
    const newImageFiles = [...currentVariant.imageFiles, ...validFiles];
    const newImagePreviews = [
      ...currentVariant.imagePreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ];

    newVariants[index] = {
      ...currentVariant,
      imageFiles: newImageFiles,
      imagePreviews: newImagePreviews,
    };

    setVariants(newVariants);

    // Reset input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  // Hapus gambar spesifik
  const handleRemoveImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    // Revoke URL for memory cleanup
    URL.revokeObjectURL(variant.imagePreviews[imageIndex]);

    const newImageFiles = variant.imageFiles.filter((_, i) => i !== imageIndex);
    const newImagePreviews = variant.imagePreviews.filter(
      (_, i) => i !== imageIndex,
    );

    newVariants[variantIndex] = {
      ...variant,
      imageFiles: newImageFiles,
      imagePreviews: newImagePreviews,
    };

    setVariants(newVariants);
  };

  // Tambah variant baru
  const addVariant = () => {
    setVariants([
      {
        desc: "",
        price: "",
        stok: "0",
        size: "",
        imageFiles: [],
        imagePreviews: [],
      },
      ...variants,
    ]);
    fileInputRefs.current.unshift(null);
  };

  // Hapus variant
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      variants[index].imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      fileInputRefs.current = fileInputRefs.current.filter(
        (_, i) => i !== index,
      );
    }
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
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
        formData.append(`variants[${index}][stok]`, variant.stok);
        formData.append(`variants[${index}][size]`, variant.size);

        // Append images
        variant.imageFiles.forEach((file) => {
          formData.append(`variants[${index}][images]`, file); // Changed key to 'images' to imply array
        });
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

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'created', product: result.data });

      // Clean up semua URL object
      variants.forEach((variant) => {
        variant.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      });

      // Reset form setelah submit
      setProductName("");
      setDescription("");
      setStatus("active");
      setSelectedCategories([]);
      setVariants([
        {
          desc: "",
          price: "",
          stok: "0",
          size: "",
          imageFiles: [],
          imagePreviews: [],
        },
      ]);
      fileInputRefs.current = [null];

      // Redirect ke halaman list product setelah 1.5 detik
      setTimeout(() => {
        window.location.href = "/product";
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/product">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali
              </Link>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <div>
              <h1 className="text-2xl font-bold">Tambah Produk Baru</h1>
              <p className="text-gray-500 text-sm">Isi informasi produk dan variannya</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/product">
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
                            onCheckedChange={() =>
                              toggleCategory(category.name)
                            }
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        <Field>
                          <FieldLabel>
                            Size{" "}
                            <span className="text-gray-400">(Opsional)</span>
                          </FieldLabel>
                          <Input
                            placeholder="Contoh: Large, 500ml"
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(index, "size", e.target.value)
                            }
                          />
                        </Field>
                      </div>

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
                          <FieldLabel>
                            Stok <span className="text-red-500">*</span>
                          </FieldLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.stok}
                            onChange={(e) =>
                              handleVariantChange(index, "stok", e.target.value)
                            }
                            required
                            min="0"
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>Gambar (Opsional - Bisa banyak)</FieldLabel>
                        <div className="space-y-4">
                          {/* Image Grid */}
                          {variant.imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {variant.imagePreviews.map(
                                (preview, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative group"
                                  >
                                    <div className="border rounded-lg overflow-hidden h-24 w-full">
                                      <img
                                        src={preview}
                                        alt={`Preview ${imgIndex + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() =>
                                        handleRemoveImage(index, imgIndex)
                                      }
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          {/* Upload Button */}
                          <div
                            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              fileInputRefs.current[index]?.click()
                            }
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
                            />
                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {variant.imagePreviews.length > 0
                                ? "Tambah Gambar Lain"
                                : "Upload Gambar"}
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, GIF • Max 5MB
                            </p>
                          </div>
                        </div>
                      </Field>
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
