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

  const getNextStatus = (currentStatus: string, allowedStatuses: string[]) => {
    const currentIndex = allowedStatuses.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === allowedStatuses.length - 1) {
      return currentStatus;
    }
    return allowedStatuses[currentIndex + 1];
  };

  const handleUpdateStatus = () => {
    const currentStatus = order?.status || "ORDERED";
    const nextStatus = getNextStatus(currentStatus, ORDER_STATUSES);

    const productUpdates = products.map((p: any) => ({
      id: p.id,
      status: nextStatus,
    }));

    updateOrder({
      status: nextStatus,
      products: productUpdates,
    });
  };

  const handleProductStatusChange = (productId: number) => {
    const product = products.find((p: any) => p.id === productId);
    const currentStatus = product?.status || "ORDERED";
    const nextStatus = getNextStatus(currentStatus, PRODUCT_STATUSES);

    // Create a copy of products with the updated status for status calculation
    const updatedProducts = products.map((p: any) =>
      p.id === productId ? { ...p, status: nextStatus } : p
    );

    // Calculate overall order status
    let nextOrderStatus = order?.status || "ORDERED";

    const allServed = updatedProducts.every((p: any) => p.status === "SERVED");
    const anyOrdered = updatedProducts.some((p: any) => p.status === "ORDERED");
    const anyProcessing = updatedProducts.some((p: any) => p.status === "PROCESSING");
    const anyReady = updatedProducts.some((p: any) => p.status === "READY");

    if (allServed) {
      nextOrderStatus = "SERVED";
    } else if (anyOrdered) {
      nextOrderStatus = "ORDERED";
    } else if (anyProcessing) {
      nextOrderStatus = "PROCESSING";
    } else if (anyReady) {
      nextOrderStatus = "READY";
    } else {
      nextOrderStatus = "ORDERED";
    }

    updateOrder({
      status: nextOrderStatus,
      products: [{ id: productId, status: nextStatus }],
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
                    Order Status
                  </div>
                  <button
                    className={`text-xs px-3 py-2 rounded border font-semibold outline-none transition-all ${order?.status === "ORDERED"
                      ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                      : order?.status === "PROCESSING"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                        : order?.status === "READY"
                          ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                          : order?.status === "SERVED"
                            ? "bg-green-100 text-green-700 border-green-300 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    disabled={updating || order?.status === "SERVED" || order?.status === "CANCELLED"}
                    onClick={handleUpdateStatus}
                  >
                    {order?.status || "ORDERED"}
                  </button>
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
                        <button
                          className={`text-[11px] px-2 py-1.5 rounded border font-semibold outline-none transition-all ${p?.status === "ORDERED"
                            ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                            : p?.status === "PROCESSING"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                              : p?.status === "READY"
                                ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                                : p?.status === "SERVED"
                                  ? "bg-green-100 text-green-700 border-green-300 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                            }`}
                          disabled={updating || p?.status === "SERVED"}
                          onClick={() => handleProductStatusChange(p.id)}
                        >
                          {p?.status?.toUpperCase() || "ORDERED"}
                        </button>
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
