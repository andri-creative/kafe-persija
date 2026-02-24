"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getOrders } from "@/lib/order-api";

export default function OrderPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const rows = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data],
  );

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

  const getTotalItems = (order: any) => {
    const products = Array.isArray(order?.products) ? order.products : [];
    return products.reduce((sum: number, p: any) => {
      const quantity = p.variants?.[0]?.quantity || p.quantity || p.qty || 0;
      return sum + Number(quantity);
    }, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const json = await getOrders();
        setData(json);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter berdasarkan Order Status (Case Sensitive sesuai API)
  const orderBaru = rows.filter((o: any) => o?.status === "ORDERED");
  const processing = rows.filter((o: any) => o?.status === "PROCESSING");
  const ready = rows.filter((o: any) => o?.status === "READY");
  const served = rows.filter((o: any) => o?.status === "SERVED");
  const cancel = rows.filter((o: any) => o?.status === "CANCELLED");

  const OrderList = ({ orders }: { orders: any[] }) => {
    if (orders.length === 0) {
      return (
        <div className="col-span-full text-center py-10 text-gray-400">
          Tidak ada data.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/order/${order.order_number}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg cursor-pointer"
          >
            <Card>
              <CardHeader className="flex items-start justify-between gap-3">
                <div>
                  <CardDescription className="mb-3">
                    {order.table?.[0]?.no_table
                      ? `Meja ${order.table[0].no_table}`
                      : "Tanpa Meja"}
                  </CardDescription>
                  <CardTitle>{order.order_number}</CardTitle>
                </div>
                <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap uppercase">
                  {order.status}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-3">Payment</div>
                  <div className="font-medium">
                    {order.payment?.status || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-3">Total Item</div>
                  <div className="font-medium">{getTotalItems(order)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-3">Tanggal Pesan</div>
                  <div className="font-medium">
                    {formatTanggalPesan(order.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order</h1>
        {loading && (
          <span className="text-sm text-blue-500 animate-pulse font-medium">
            Memuat data...
          </span>
        )}
      </div>

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-12 bg-gray-100 p-1">
          <TabsTrigger
            value="order"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all"
          >
            Order Baru ({orderBaru.length})
          </TabsTrigger>
          <TabsTrigger
            value="processing"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 transition-all"
          >
            Prosesing ({processing.length})
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-green-600 transition-all"
          >
            Ready ({ready.length})
          </TabsTrigger>
          <TabsTrigger
            value="served"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 transition-all"
          >
            Served ({served.length})
          </TabsTrigger>
          <TabsTrigger
            value="cancel"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 transition-all"
          >
            Cancel ({cancel.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <OrderList orders={orderBaru} />
        </TabsContent>

        <TabsContent value="processing">
          <OrderList orders={processing} />
        </TabsContent>

        <TabsContent value="ready">
          <OrderList orders={ready} />
        </TabsContent>

        <TabsContent value="served">
          <OrderList orders={served} />
        </TabsContent>

        <TabsContent value="cancel">
          <OrderList orders={cancel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
