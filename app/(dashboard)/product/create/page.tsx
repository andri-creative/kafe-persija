"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogoLoading } from "@/components/logo-loading";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";

import { ProductInfoSection } from "../_components/ProductInfoSection";
import { VariantSection } from "../_components/VariantSection";
import { useProductForm } from "../_hooks/useProductForm";

export default function CreateProductPage() {
  const {
    loading, setLoading,
    minLoading, setMinLoading,
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
    const timer = setTimeout(() => setMinLoading(false), 1000);
    
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
    return () => clearTimeout(timer);
  }, [setLoading, setMinLoading, setCategoriesList]);

  if (loading || minLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <LogoLoading width={150} height={150} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Loading Product Form...</p>
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
