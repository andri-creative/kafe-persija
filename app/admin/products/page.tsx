"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Coffee } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Product = {
  id: number;
  name: string;
  status: string;
  description?: string;
  categories: { category: { id: number; name: string } }[];
  variants: {
    id: number;
    desc: string;
    price: number;
    images: { id: number; image: string }[];
  }[];
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    // Show instant feedback
    toast.success(`Status changed to ${newStatus}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
    });

    try {
      const response = await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: currentStatus } : p))
      );
      toast.error("Failed to update status", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
          <p className="text-muted-foreground">Manage your cafe menu items</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/admin/products/new")}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const categoryName =
            product.categories
              .map((c) => c.category.name)
              .join(", ") || "Uncategorized";

          const firstVariant = product.variants[0];
          const price = firstVariant?.price || 0;
          const image = firstVariant?.images?.[0]?.image;

          return (
            <Card key={product.id} className="relative overflow-hidden group">
              {/* Image Section */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                {image ? (
                  <>
                    <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <img
                      src={image}
                      alt={product.name}
                      className="relative z-0 w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Coffee className="h-16 w-16 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {categoryName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-primary">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                  {product.variants.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {product.variants.length} variants
                    </Badge>
                  )}
                </div>
              </CardContent>

              {/* Footer with Actions */}
              <CardFooter className="flex flex-col gap-3 pt-0">
                {/* Status Toggle */}
                <div className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-md">
                  <Label htmlFor={`status-${product.id}`} className="text-sm font-medium cursor-pointer">
                    {product.status === "active" ? "Active" : "Inactive"}
                  </Label>
                  <Switch
                    id={`status-${product.id}`}
                    checked={product.status === "active"}
                    onCheckedChange={() => toggleStatus(product.id, product.status)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
