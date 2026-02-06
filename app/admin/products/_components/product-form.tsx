"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Plus, Trash2, ChevronDown, X } from "lucide-react";

type Category = { id: number; name: string };
type Variant = {
  id?: number;
  desc: string;
  price: number;
  image?: File;
};

type ProductFormProps = {
  onSuccess?: () => void;
  productId?: number;
};

export default function ProductForm({ onSuccess, productId }: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [variants, setVariants] = useState<Variant[]>([{ desc: "", price: 0 }]);
  const [loading, setLoading] = useState(false);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  // Load product data jika edit
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(product => {
        setName(product.name);
        setDescription(product.description || "");
        setStatus(product.status);
        setSelectedCategories(product.categories.map((c: any) => c.category_id));
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants.map((v: any) => ({
            id: v.id,
            desc: v.desc || "",
            price: Number(v.price),
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const addVariant = () => {
    setVariants([...variants, { desc: "", price: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const body = { name, description, status, category_ids: selectedCategories };
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (res.ok && !productId) {
      // Jika create product baru, tambahkan variants
      const createdProductId = data.id;
      
      // Upload variants satu per satu
      for (const variant of variants) {
        if (variant.price > 0) { // Only save variants with price
          const formData = new FormData();
          formData.append("desc", variant.desc);
          formData.append("price", String(variant.price));
          if (variant.image) formData.append("image", variant.image);

          await fetch(`/api/products/${createdProductId}/variants`, {
            method: "POST",
            body: formData,
          });
        }
      }
    }
    
    setLoading(false);
    
    if (res.ok) {
      onSuccess?.();
    } else {
      alert(data.message || "Failed to save product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Cappuccino, Croissant"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">✅ Active</SelectItem>
                <SelectItem value="inactive">⏸️ Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Categories</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  {selectedCategories.length === 0 ? (
                    <span className="text-muted-foreground">Choose categories...</span>
                  ) : (
                    <span>
                      {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-64 overflow-y-auto p-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      No categories available
                    </p>
                  ) : (
                    categories.map(cat => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories
                  .filter(cat => selectedCategories.includes(cat.id))
                  .map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Variants Section - Only for new products */}
      {!productId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Variants</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-1" /> Add Variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-3 items-end border p-4 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={variant.desc}
                    onChange={e => updateVariant(index, "desc", e.target.value)}
                    placeholder="e.g. Small, Medium, Large"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Price (Rp) *</Label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={e => updateVariant(index, "price", Number(e.target.value))}
                    placeholder="25000"
                    min="0"
                  />
                </div>
                <div className="w-40 space-y-2">
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => updateVariant(index, "image", e.target.files?.[0])}
                  />
                </div>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No variants yet. Click "Add Variant" to create one.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
