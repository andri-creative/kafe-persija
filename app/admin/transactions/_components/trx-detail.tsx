"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type OrderItem = {
  id: number;
  user_name: string;
  total: number;
  status: string;
  created_at: string;
  items: { product_name: string; variant: string; qty: number; price: number }[];
};

export default function TrxDetail({
  order,
  onClose,
}: {
  order: OrderItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-3/4 max-w-2xl">
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Order Detail #{order.id}</h2>
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <p>
            <strong>Customer:</strong> {order.user_name}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Created:</strong> {new Date(order.created_at).toLocaleString()}
          </p>

          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Variant</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{item.product_name}</td>
                  <td className="border px-2 py-1">{item.variant}</td>
                  <td className="border px-2 py-1">{item.qty}</td>
                  <td className="border px-2 py-1">{item.price.toLocaleString()}</td>
                  <td className="border px-2 py-1">{(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right font-bold">
            Total: Rp {order.total.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
