import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { ProductVariantFormData as VariantFormData, Category } from "../types";

export function useProductForm(productId?: string) {
  const { data: session } = useSession();
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(!!productId);
  const [minLoading, setMinLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    categories: [] as string[],
  });

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

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Actions
  const toggleCategory = (categoryName: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories;
      const newCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c) => c !== categoryName)
        : [...currentCategories, categoryName];
      return { ...prev, categories: newCategories };
    });
  };

  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newVariants = [...variants];
    const currentVariant = newVariants[index];
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    newVariants[index] = {
      ...currentVariant,
      imageFiles: [...currentVariant.imageFiles, ...validFiles],
      imagePreviews: [...currentVariant.imagePreviews, ...validFiles.map(f => URL.createObjectURL(f))],
    };
    setVariants(newVariants);
    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = "";
  };

  const handleRemoveImage = (variantIndex: number, type: "new" | "existing", imageIndex: number) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];

    if (type === "new") {
      URL.revokeObjectURL(variant.imagePreviews[imageIndex]);
      variant.imageFiles = variant.imageFiles.filter((_, i) => i !== imageIndex);
      variant.imagePreviews = variant.imagePreviews.filter((_, i) => i !== imageIndex);
    } else {
      const removedImg = variant.existingImages[imageIndex];
      variant.existingImages = variant.existingImages.filter((_, i) => i !== imageIndex);
      variant.removedImageIds = [...variant.removedImageIds, removedImg.id];
    }
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([{
      desc: "", price: "", stok: "0", size: "",
      imageFiles: [], imagePreviews: [], existingImages: [], removedImageIds: []
    }, ...variants]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      variants[index].imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    if (!formData.name.trim()) { toast.error("Nama produk harus diisi"); return false; }
    if (formData.categories.length === 0) { toast.error("Pilih minimal satu kategori"); return false; }
    if (variants.some(v => !v.desc.trim() || !v.price || Number(v.price) <= 0)) {
      toast.error("Semua variant harus memiliki deskripsi dan harga valid");
      return false;
    }
    return true;
  };

  const saveProduct = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("status", formData.status);
      formData.categories.forEach(c => formDataObj.append("categories", c));

      variants.forEach((v, i) => {
        if (v.id) formDataObj.append(`variants[${i}][id]`, v.id.toString());
        formDataObj.append(`variants[${i}][desc]`, v.desc);
        formDataObj.append(`variants[${i}][price]`, v.price);
        formDataObj.append(`variants[${i}][stok]`, v.stok);
        formDataObj.append(`variants[${i}][size]`, v.size);
        v.imageFiles.forEach(f => formDataObj.append(`variants[${i}][images]`, f));
        if (v.removedImageIds.length > 0) {
          formDataObj.append(`variants[${i}][removedImageIds]`, v.removedImageIds.join(","));
        }
      });

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, { method, body: formDataObj });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Gagal menyimpan produk");

      toast.success(productId ? "Produk berhasil diupdate!" : "Produk berhasil dibuat!");
      
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: productId ? 'updated' : 'created', id: productId || result.data.id, product: result.data });

      variants.forEach(v => v.imagePreviews.forEach(url => URL.revokeObjectURL(url)));
      setTimeout(() => router.push("/product"), 1500);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading, setLoading,
    minLoading, setMinLoading,
    saving,
    formData, setFormData,
    variants, setVariants,
    categoriesList, setCategoriesList,
    fileInputRefs,
    toggleCategory,
    handleVariantChange,
    handleImageUpload,
    handleRemoveImage,
    addVariant,
    removeVariant,
    saveProduct
  };
}
