"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import ProductVariantTable from "./product-variant-table";
import ProductVariantForm from "./product-variant-form";

type Variant = {
  id: number;
  desc: string;
  price: number;
  images: { id: number; image: string }[];
};

type Props = {
  productId: number;
};

export default function ProductVariantManager({ productId }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editVariantId, setEditVariantId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchVariants = () => {
    setLoading(true);
    fetch(`/api/products/${productId}/variants`)
      .then((res) => res.json())
      .then((data) => {
        setVariants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const handleEdit = (id: number) => {
    setEditVariantId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    await fetch(`/api/products/${productId}/variants?variant_id=${id}`, {
      method: "DELETE",
    });
    fetchVariants();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Product Variants</h2>
            <p className="text-sm text-muted-foreground">
              {variants.length} variant{variants.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditVariantId(undefined);
            setShowForm(!showForm);
          }}
          variant={showForm ? "outline" : "default"}
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "Add Variant"}
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editVariantId ? "Edit Variant" : "New Variant"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductVariantForm
              productId={productId}
              variantId={editVariantId}
              onSuccess={() => {
                setShowForm(false);
                setEditVariantId(undefined);
                fetchVariants();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading variants...</div>
          ) : variants.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold mb-1">No variants yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first variant to get started
              </p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Variant
              </Button>
            </div>
          ) : (
            <ProductVariantTable
              variants={variants}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
