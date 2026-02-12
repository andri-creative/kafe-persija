"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CategoryForm from "./category-form";
import { Button } from "@/components/ui/button";

type Category = {
  id: number;
  name: string;
  image?: string;
};

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    fetchCategories();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => {
          setSelected(null);
          setOpen(true);
        }}>
          + Add Category
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-3">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  )}
                </td>
                <td className="p-3">{cat.name}</td>
                <td className="p-3 text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelected(cat);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(cat.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryForm
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
        onSuccess={fetchCategories}
      />
    </>
  );
}
