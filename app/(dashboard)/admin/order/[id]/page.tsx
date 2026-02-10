"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getOrders, updateOrderStatus } from "@/lib/order-api";
import { toast } from "react-toastify";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(
    () => decodeURIComponent(String(params?.id ?? "")),
    [params],
  );

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const order = useMemo(() => {
    return (
      rows.find((o: any) => String(o?._id ?? "") === id) ??
      rows.find((o: any) => String(o?.order_number ?? "") === id) ??
      null
    );
  }, [rows, id]);

  const formatRupiah = (n?: number) => {
    const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const json = await getOrders();
      setData(json);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Gagal mengambil data order",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const table = order?.table?.[0];
  const products = Array.isArray(order?.products) ? order.products : [];
  const paymentSources = Array.isArray(order?.payment?.sources)
    ? order.payment.sources
    : [];
  const paymentMethods = useMemo(() => {
    const set = new Set<string>();
    for (const s of paymentSources) {
      const name = String(s?.name ?? "").trim();
      if (name) set.add(name);
    }
    return Array.from(set);
  }, [paymentSources]);

  const updateOrder = async (payload: any) => {
    try {
      setUpdating(true);

      await updateOrderStatus({
        order_number: order?.order_number,
        ...payload,
      });

      await fetchData();
      toast.success("Berhasil memperbarui status!");
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Terjadi kesalahan saat update",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    updateOrder({ status: newStatus });
  };

  const handleProductStatusChange = (productId: number, newStatus: string) => {
    updateOrder({
      products: [{ id: productId, status: newStatus }],
    });
  };

  const ORDER_STATUSES = [
    "ORDERED",
    "PROCESSING",
    "READY",
    "SERVED",
    "CANCELLED",
  ];
  const PRODUCT_STATUSES = ["ORDERED", "PROCESSING", "READY", "SERVED"];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Order</h1>
          <p className="text-sm text-gray-500 font-mono break-all">{id}</p>
        </div>
        <Link href="/admin/order" className="text-sm underline">
          Kembali
        </Link>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {!loading && error && (
        <div className="text-sm text-red-600">Error: {error}</div>
      )}

      {!loading && !error && !order && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="font-semibold">Order tidak ditemukan</div>
            <div className="text-sm text-gray-500">
              ID ini tidak ada di list order yang didapat.
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && order && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-500">Order Number</div>
                  <div className="text-lg font-semibold truncate">
                    {order?.order_number ?? "-"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Created:{" "}
                    <span className="text-gray-900 font-medium">
                      {formatTanggalPesan(order?.created_at ?? order?.created)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Table:{" "}
                    <span className="text-gray-900 font-medium">
                      {table?.no_table != null ? table.no_table : "-"}
                      {table?.desc ? ` - ${table.desc}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-gray-500 text-right">
                    Update Order Status
                  </div>
                  <select
                    className="text-xs px-2 py-1 rounded border bg-white text-gray-700 outline-none"
                    value={order?.status}
                    disabled={updating}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updating && (
                    <span className="text-[10px] text-orange-500 text-right animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-gray-500">Charge</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatRupiah(
                    typeof order?.total_amount === "number"
                      ? order.total_amount
                      : typeof order?.amount === "number"
                        ? order.amount
                        : 0,
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {products.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="font-semibold">Order(s)</div>
                <div className="flex flex-wrap gap-4">
                  {products.map((p: any) => (
                    <div
                      key={p?.id ?? p?._id ?? p?.name ?? Math.random()}
                      className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 min-w-[220px] flex-1 sm:flex-none"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-sm">
                          {p?.name ?? "-"}
                        </span>
                        {Array.isArray(p?.variants) &&
                          p.variants[0]?.quantity != null && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              x{p.variants[0].quantity}
                            </span>
                          )}
                      </div>

                      <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                          Status Produk
                        </div>
                        <select
                          className="text-[11px] px-2 py-1.5 rounded border bg-white text-gray-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          value={p?.status || "ordered"}
                          disabled={updating}
                          onChange={(e) =>
                            handleProductStatusChange(p.id, e.target.value)
                          }
                        >
                          {PRODUCT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="font-semibold">
                Payment(s):{" "}
                <span className="font-bold">
                  {order?.payment?.status ?? "-"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {paymentMethods.length === 0 ? (
                  <span className="text-sm text-gray-500">-</span>
                ) : (
                  paymentMethods.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center rounded-full border bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      {m}
                    </span>
                  ))
                )}
              </div>

              <div className="pt-2 text-xs text-gray-500">
                Order ID:{" "}
                <span className="font-mono break-all">{order?._id ?? "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
