"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogoLoading } from "@/components/logo-loading";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";

import { ProductInfoSection } from "../../_components/ProductInfoSection";
import { VariantSection } from "../../_components/VariantSection";
import { useProductForm } from "../../_hooks/useProductForm";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const {
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
  } = useProductForm(productId);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setMinLoading]);

  useEffect(() => {
    if (productId) {
      const fetchData = async () => {
        try {
          const [productRes, categoriesRes] = await Promise.all([
            fetch(`/api/products/${productId}`),
            fetch("/api/categories")
          ]);

          if (!productRes.ok) throw new Error("Failed to fetch product");
          
          const product = await productRes.json();
          const categories = categoriesRes.ok ? await categoriesRes.json() : [];

          setCategoriesList(categories);
          setFormData({
            name: product.name,
            description: product.description || "",
            status: product.status,
            categories: product.product_category_trx.map((trx: any) => trx.product_category.name),
          });

          if (product.product_variants.length > 0) {
            setVariants(product.product_variants.map((v: any) => ({
              id: v.id,
              desc: v.desc || "",
              price: v.price.toString(),
              stok: v.stok ? v.stok.toString() : "0",
              size: v.size || "",
              imageFiles: [],
              imagePreviews: [],
              existingImages: v.product_variant_images.map((img: any) => ({
                id: img.id, url: img.image
              })),
              removedImageIds: [],
            })));
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Gagal memuat data produk");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [productId, setLoading, setCategoriesList, setFormData, setVariants]);

  if (loading || minLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <LogoLoading width={150} height={150} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Menghubungkan ke Pusat Data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ButtonsComponentsBack backUrl="/product" title="Produk" showText />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-xl font-bold">Edit Produk</h1>
            <p className="text-gray-500 text-xs">Ubah informasi produk dan variannya</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/product">
            <Button variant="outline" className="h-8 text-xs">Batal</Button>
          </Link>
          <ButtonsComponentsSave
            title="Produk"
            isLoading={saving}
            className="h-8 text-xs"
            onClick={saveProduct}
          />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveProduct(); }}>
        <div className="flex flex-col lg:flex-row gap-6">
          <ProductInfoSection
            productName={formData.name}
            setProductName={(val) => setFormData(p => ({ ...p, name: val }))}
            description={formData.description}
            setDescription={(val) => setFormData(p => ({ ...p, description: val }))}
            status={formData.status}
            setStatus={(val) => setFormData(p => ({ ...p, status: val }))}
            selectedCategories={formData.categories}
            toggleCategory={toggleCategory}
            categoriesList={categoriesList}
            isSaving={saving}
          />

          <VariantSection
            variants={variants}
            addVariant={addVariant}
            removeVariant={removeVariant}
            handleVariantChange={handleVariantChange}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            fileInputRefs={fileInputRefs}
            isSaving={saving}
          />
        </div>
      </form>
    </div>
  );
}
