"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";

type VariantFormProps = {
  productId: number;
  variantId?: number;
  onSuccess?: () => void;
};

export default function ProductVariantForm({ productId, variantId, onSuccess }: VariantFormProps) {
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load variant jika edit
  useEffect(() => {
    if (!variantId) return;
    setLoading(true);
    fetch(`/api/products/${productId}/variants?variant_id=${variantId}`)
      .then(res => res.json())
      .then(data => {
        setDesc(data.desc || "");
        setPrice(data.price || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId, variantId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("desc", desc);
    formData.append("price", String(price));
    if (imageFile) formData.append("image", imageFile);

    const url = `/api/products/${productId}/variants${variantId ? `?variant_id=${variantId}` : ""}`;
    const method = variantId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: formData });
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      setDesc("");
      setPrice(0);
      setImageFile(null);
      setImagePreview(null);
      onSuccess?.();
    } else {
      alert(data.message || "Failed to save variant");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Variant Information</h3>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea 
              id="desc" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              placeholder="e.g. Small, Medium, Large, Hot, Iced..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Rp) *</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              placeholder="25000"
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Variant Image</Label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <Label htmlFor="image" className="cursor-pointer">
                  <span className="text-sm text-primary hover:underline">
                    Click to upload image
                  </span>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {variantId ? "Update Variant" : "Create Variant"}
        </Button>
      </div>
    </form>
  );
}
