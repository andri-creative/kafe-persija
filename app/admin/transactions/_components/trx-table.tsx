"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TrxDetail from "./trx-detail";

type OrderItem = {
  id: number;
  user_name: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
};

export default function TrxTable() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/transactions")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      })
      .then(data => {
        // Pastikan data adalah array
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API response is not an array:", data);
          setError("Invalid data format from server");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || "Failed to load transactions");
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Orders</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found</p>
            </div>
          ) : (
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Total</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Created</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="border px-2 py-1">{order.id}</td>
                    <td className="border px-2 py-1">{order.user_name}</td>
                    <td className="border px-2 py-1">Rp {Number(order.total).toLocaleString("id-ID")}</td>
                    <td className="border px-2 py-1">{order.status}</td>
                    <td className="border px-2 py-1">{new Date(order.created_at).toLocaleString("id-ID")}</td>
                    <td className="border px-2 py-1">
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <TrxDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
