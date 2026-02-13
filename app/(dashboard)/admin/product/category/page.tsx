"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { TabelCategory } from "../_components/tabel-category";
import CreateCategory from "../_components/create-category";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProductCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <h1>Product Category</h1>
        </CardHeader>
        <CardContent>
          <TabelCategory
            categories={categories}
            onDelete={(id) =>
              setCategories((prev) => prev.filter((c) => c.id !== id))
            }
          />
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <h1>New Category</h1>
        </CardHeader>
        <CardContent>
          <CreateCategory
            onCreated={(newCategory) =>
              setCategories((prev) => [newCategory, ...prev])
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
