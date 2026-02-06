"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ImageIcon } from "lucide-react";

type Variant = {
  id: number;
  desc: string;
  price: number;
  images: { id: number; image: string }[];
};

type Props = {
  variants: Variant[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ProductVariantTable({ variants, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold text-sm">Description</th>
            <th className="text-left p-3 font-semibold text-sm">Price</th>
            <th className="text-left p-3 font-semibold text-sm">Images</th>
            <th className="text-right p-3 font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-3">
                <div className="font-medium">{v.desc || "—"}</div>
              </td>
              <td className="p-3">
                <Badge variant="secondary" className="font-mono">
                  Rp {Number(v.price).toLocaleString("id-ID")}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  {v.images.length > 0 ? (
                    v.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.image}
                        alt="Variant"
                        className="h-12 w-12 object-cover rounded border hover:scale-110 transition-transform cursor-pointer"
                      />
                    ))
                  ) : (
                    <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(v.id)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(v.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
