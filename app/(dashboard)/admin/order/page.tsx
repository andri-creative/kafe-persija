"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function OrderPage() {
  const [data, setData] = useState<any>(null);
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  const getTotalItems = (order: any) => {
    // API uses `products[].variants[].quantity`
    const products = Array.isArray(order?.products) ? order.products : [];
    const fromProducts = products.reduce((sum: number, p: any) => {
      const variants = Array.isArray(p?.variants) ? p.variants : [];
      if (variants.length > 0) {
        return (
          sum +
          variants.reduce((s: number, v: any) => s + (Number(v?.quantity) || 0), 0)
        );
      }
      return sum + (Number(p?.qty ?? p?.quantity) || 0);
    }, 0);

    // fallback if someday API returns `items`
    const items = Array.isArray(order?.items) ? order.items : [];
    const fromItems = items.reduce(
      (sum: number, it: any) => sum + (Number(it?.qty ?? it?.quantity) || 0),
      0,
    );

    return fromProducts || fromItems || 0;
  };

  const formatTanggalPesan = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  useEffect(() => {
    const getOrder = async () => {
      const response = await fetch(
        "https://api.dev.accolaplay.id/v2/kafe/dashboard/orders",
      );
      const json = await response.json();
      setData(json);
    };
    getOrder();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order</h1>
        <p className="text-sm text-gray-500">
          Total: {typeof data?.count === "number" ? data.count : rows.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((o: any) => (
          <Link
            key={o?._id ?? o?.order_number ?? Math.random()}
            href={`/admin/order/${encodeURIComponent(
              String(o?._id ?? o?.order_number ?? ""),
            )}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <Card className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500">Order Number</div>
                    <div className="font-semibold truncate">
                      {o?.order_number ?? "-"}
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                    {o?.status ?? "-"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Payment</div>
                    <div className="font-medium">
                      {o?.payment?.status ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Item</div>
                    <div className="font-medium">{getTotalItems(o)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tanggal Pesan</div>
                    <div className="font-medium">
                      {formatTanggalPesan(o?.created_at ?? o?.created)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="text-sm text-gray-500">Belum ada order.</div>
      )}
    </div>
  );
}
