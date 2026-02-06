"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  status: string;
};

type Props = {
  products: Product[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  return (
    <table className="w-full border rounded">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.id} className="border-t">
            <td className="p-2">{p.name}</td>
            <td>{p.status}</td>
            <td className="flex gap-2 p-2">
              <Button size="sm" onClick={() => onEdit(p.id)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
