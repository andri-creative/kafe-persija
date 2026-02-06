"use client";

import { useRouter } from "next/navigation";
import ProductForm from "../_components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product with variants</p>
        </div>
      </div>

      <ProductForm
        onSuccess={() => {
          router.push("/admin/products");
        }}
      />
    </div>
  );
}