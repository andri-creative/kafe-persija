"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";

import { ProductInfoSection } from "../_components/ProductInfoSection";
import { VariantSection } from "../_components/VariantSection";
import { useProductForm } from "../_hooks/useProductForm";

export default function CreateProductPage() {
  const {
    loading, setLoading,
    saving,
    formData, setFormData,
    variants,
    categoriesList, setCategoriesList,
    fileInputRefs,
    toggleCategory,
    handleVariantChange,
    handleImageUpload,
    handleRemoveImage,
    addVariant,
    removeVariant,
    saveProduct
  } = useProductForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategoriesList(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [setLoading, setCategoriesList]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-full bg-zinc-100 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-zinc-50 animate-pulse rounded-2xl" />
          <div className="h-[400px] bg-zinc-50 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ButtonsComponentsBack backUrl="/product" title="Product" showText />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-xl font-bold">Add New Product</h1>
            <p className="text-gray-500 text-xs">Fill in product and variant information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/product">
            <Button variant="outline" className="h-8 text-xs">Cancel</Button>
          </Link>
          <ButtonsComponentsSave
            title="Product"
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
