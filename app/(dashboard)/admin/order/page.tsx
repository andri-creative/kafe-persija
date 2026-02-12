"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo, useRef } from "react";
import { getOrders, updateOrderStatus } from "@/lib/order-api";
import { useSocketOrders } from "@/hooks/useSocketOrders";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function OrderBaruPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [updating, setUpdating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const ORDER_STATUSES = ["ORDERED", "PROCESSING", "READY", "SERVED", "CANCELLED"];
    const PRODUCT_STATUSES = ["ORDERED", "PROCESSING", "READY", "SERVED"];

    const getNextStatus = (currentStatus: string, allowedStatuses: string[]) => {
        const currentIndex = allowedStatuses.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === allowedStatuses.length - 1) {
            return currentStatus;
        }
        return allowedStatuses[currentIndex + 1];
    };

    const handleUpdateStatus = async (order: any) => {
        if (!order) return;
        const currentStatus = order.status || "ORDERED";
        const nextStatus = getNextStatus(currentStatus, ORDER_STATUSES);

        if (nextStatus === currentStatus) return;

        try {
            setUpdating(true);

            // If status is moving forward, update products too like in detail page
            const products = Array.isArray(order.products) ? order.products : [];
            const productUpdates = products.map((p: any) => ({
                id: p.id,
                status: PRODUCT_STATUSES.includes(nextStatus) ? nextStatus : p.status,
            }));

            await updateOrderStatus({
                order_number: order.order_number,
                status: nextStatus,
                products: nextStatus !== "CANCELLED" ? productUpdates : [],
            });

            toast.success(`Status updated to ${nextStatus}`);
            setSelectedOrder(null);

            // Refresh data
            const json = await getOrders();
            setData(json);
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

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

    const handleProductStatusChange = async (order: any, productId: number) => {
        const products = Array.isArray(order?.products) ? order.products : [];
        const product = products.find((p: any) => p.id === productId);
        const currentStatus = product?.status || "ORDERED";
        const nextStatus = getNextStatus(currentStatus, PRODUCT_STATUSES);

        // Calculate overall order status
        const updatedProducts = products.map((p: any) =>
            p.id === productId ? { ...p, status: nextStatus } : p
        );

        let nextOrderStatus = order?.status || "ORDERED";
        const allServed = updatedProducts.every((p: any) => p.status === "SERVED");
        const anyReady = updatedProducts.some((p: any) => p.status === "READY");
        const anyProcessing = updatedProducts.some((p: any) => p.status === "PROCESSING");

        if (allServed) {
            nextOrderStatus = "SERVED";
        } else if (anyReady) {
            nextOrderStatus = "READY";
        } else if (anyProcessing) {
            nextOrderStatus = "PROCESSING";
        } else {
            nextOrderStatus = "ORDERED";
        }

        try {
            setUpdating(true);
            await updateOrderStatus({
                order_number: order.order_number,
                status: nextOrderStatus,
                products: [{ id: productId, status: nextStatus }],
            });

            toast.success("Product updated");

            // Refresh local selected order for UI sync
            const newOrder = {
                ...order,
                status: nextOrderStatus,
                products: updatedProducts
            };
            setSelectedOrder(newOrder);

            const json = await getOrders();
            setData(json);
        } catch (error: any) {
            toast.error(error?.message || "Failed update");
        } finally {
            setUpdating(false);
        }
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

    const initialOrders = useMemo(() => data?.rows || [], [data]);
    const { orders: rows, isConnected } = useSocketOrders(initialOrders);

    const filterOrders = (status: string) => {
        return rows.filter((o: any) => o?.status?.toUpperCase() === status.toUpperCase())
            .sort((a: any, b: any) => {
                const timeA = new Date(a.updated_at || a.created_at).getTime();
                const timeB = new Date(b.updated_at || b.created_at).getTime();
                return timeB - timeA;
            });
    };

    const orderBaru = filterOrders("ORDERED");
    const processing = filterOrders("PROCESSING");
    const ready = filterOrders("READY");
    const served = filterOrders("SERVED");
    const cancelled = filterOrders("CANCELLED");

    const getTotalItems = (order: any) => {
        const products = Array.isArray(order?.products) ? order.products : [];
        return products.reduce((sum: number, p: any) => {
            const quantity = p.variants?.[0]?.quantity || p.quantity || p.qty || 0;
            return sum + Number(quantity);
        }, 0);
    };

    const StatusColumn = ({
        title,
        count,
        orders,
        bgColor,
        headerBgColor,
        textColor,
    }: {
        title: string,
        count: number,
        orders: any[],
        bgColor: string,
        headerBgColor: string,
        textColor: string,
    }) => (
        <div className={`flex flex-col h-full ${bgColor} border-r border-gray-100 last:border-r-0 min-w-[200px] flex-1`}>
            {/* Column Header */}
            <div className={`${headerBgColor} p-1.5 text-center shadow-sm z-10 sticky top-0`}>
                <h2 className="text-[9px] font-black text-white uppercase tracking-[0.1em]">{title}</h2>
                <div className="text-white/90 text-[10px] font-black leading-none mt-0.5">
                    {count}
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-16 text-gray-400 opacity-30 italic text-[9px]">
                        Empty
                    </div>
                ) : (
                    orders.map(order => (
                        <Card
                            key={order._id}
                            className="border-l-2 overflow-hidden shadow-none border-gray-50 hover:border-blue-200 hover:bg-blue-50/10 transition-all cursor-pointer"
                            style={{ borderLeftColor: textColor }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                            }}
                        >
                            <CardContent className="p-1.5 pointer-events-none">
                                {/* Order Header - Matching OrderPage hierarchy */}
                                <div className="flex justify-between items-start mb-1.5 leading-tight">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[7px] text-gray-500 font-black uppercase tracking-wider mb-0.5">
                                            {order.table?.[0]?.no_table ? `Meja ${order.table[0].no_table}` : "Tanpa Meja"}
                                        </div>
                                        <div className="font-black text-[10px] text-gray-900 truncate tracking-tight uppercase">{order.order_number}</div>
                                    </div>
                                    <div className="text-[7px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-black uppercase whitespace-nowrap border border-gray-200/50">
                                        {order.status}
                                    </div>
                                </div>

                                {/* Order Info Grid - 3 Columns matching OrderPage data points */}
                                <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-gray-100">
                                    <div className="min-w-0">
                                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Payment</div>
                                        <div className={`text-[8px] font-black truncate uppercase ${order.payment?.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {order.payment?.status || "-"}
                                        </div>
                                    </div>
                                    <div className="min-w-0 text-center">
                                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Items</div>
                                        <div className="text-[8px] font-black text-gray-900 leading-none">
                                            {getTotalItems(order)}
                                        </div>
                                    </div>
                                    <div className="min-w-0 text-right">
                                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Time</div>
                                        <div className="text-[8px] text-gray-500 font-bold leading-none">
                                            {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(order.created_at))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );

    const activeFullscreen = isFullscreen || isSimulatedFullscreen;

    return (
        <div
            ref={containerRef}
            className={`relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer select-none transition-all duration-300 ${activeFullscreen
                ? "fixed inset-0 z-9999 h-screen w-screen rounded-none border-none"
                : "h-screen mb-6"
                }`}
            title={activeFullscreen ? "Klik untuk keluar Fullscreen" : "Klik untuk masuk Fullscreen"}
        >
            {/* Connection Status Indicator */}
            <div className="absolute bottom-4 right-4 z-50 flex items-center gap-1.5 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-none shadow-lg border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-[8px] font-black text-white tracking-[0.2em] uppercase">
                    {isConnected ? 'LIVE' : 'OFF'}
                </span>
            </div>

            {loading && !data ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing...</div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                    <StatusColumn
                        title="ORDERED"
                        count={orderBaru.length}
                        orders={orderBaru}
                        bgColor="bg-blue-50"
                        headerBgColor="bg-blue-600"
                        textColor="#2563eb"
                    />

                    <StatusColumn
                        title="PROCESSING"
                        count={processing.length}
                        orders={processing}
                        bgColor="bg-amber-50"
                        headerBgColor="bg-amber-500"
                        textColor="#f59e0b"
                    />

                    <StatusColumn
                        title="READY"
                        count={ready.length}
                        orders={ready}
                        bgColor="bg-green-50"
                        headerBgColor="bg-green-600"
                        textColor="#16a34a"
                    />

                    <StatusColumn
                        title="SERVED"
                        count={served.length}
                        orders={served}
                        bgColor="bg-indigo-50"
                        headerBgColor="bg-indigo-600"
                        textColor="#4f46e5"
                    />

                    <StatusColumn
                        title="CANCELLED"
                        count={cancelled.length}
                        orders={cancelled}
                        bgColor="bg-red-50"
                        headerBgColor="bg-red-600"
                        textColor="#dc2626"
                    />
                </div>
            )}

            {/* Detailed Order Dialog - Mirroring app/(dashboard)/admin/order/[id]/page.tsx */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent showCloseButton={false} className="sm:max-w-xl bg-gray-50 border-0 shadow-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Header Section */}
                    <div className="bg-white p-6 border-b border-gray-100 shrink-0">
                        <DialogHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0">
                                    <DialogTitle className="text-xl font-black text-gray-900 leading-tight flex flex-col">
                                        <span>
                                            Detail Order
                                        </span>
                                        <span className="text-blue-600 ml-2">#{selectedOrder?.order_number}</span>
                                    </DialogTitle>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status</div>
                                    <button
                                        className={`text-xs px-4 py-2 rounded-xl border cursor-pointer font-black transition-all shadow-sm active:scale-95 ${selectedOrder?.status === "ORDERED"
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : selectedOrder?.status === "PROCESSING"
                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                : selectedOrder?.status === "READY"
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : selectedOrder?.status === "SERVED"
                                                        ? "bg-indigo-100 text-indigo-700 border-indigo-200 cursor-not-allowed"
                                                        : "bg-gray-100 text-gray-700 border-gray-200"
                                            }`}
                                        disabled={updating || selectedOrder?.status === "SERVED" || selectedOrder?.status === "CANCELLED"}
                                        onClick={() => handleUpdateStatus(selectedOrder)}
                                    >
                                        {selectedOrder?.status || "ORDERED"}
                                    </button>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Scrollable Content Section */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Summary Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Created At</div>
                                <div className="text-sm font-bold text-gray-900">{formatTanggalPesan(selectedOrder?.created_at)}</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Table</div>
                                <div className="text-sm font-bold text-gray-900">
                                    {selectedOrder?.table?.[0]?.no_table ? `Table ${selectedOrder.table[0].no_table}` : "Tanpa Meja"}
                                </div>
                            </div>
                        </div>

                        {/* Product List Section */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Product List ({selectedOrder?.products?.length || 0})</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedOrder?.products?.map((p: any) => (
                                    <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-black text-sm text-gray-900 truncate">{p.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-lg font-black">
                                                    x{p.variants?.[0]?.quantity || 1}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={`text-[10px] px-3 py-1.5 cursor-pointer rounded-lg border font-black transition-all ${p.status === "ORDERED"
                                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                                : p.status === "PROCESSING"
                                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                                    : p.status === "READY"
                                                        ? "bg-green-50 text-green-600 border-green-100"
                                                        : p.status === "SERVED"
                                                            ? "bg-indigo-50 text-indigo-600 border-indigo-100 cursor-not-allowed"
                                                            : "bg-gray-50 text-gray-600 border-gray-100"
                                                }`}
                                            disabled={updating || p.status === "SERVED"}
                                            onClick={() => handleProductStatusChange(selectedOrder, p.id)}
                                        >
                                            {p.status || "ORDERED"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Charge</div>
                                    <div className="text-2xl font-black text-gray-900">{formatRupiah(selectedOrder?.total_amount || selectedOrder?.amount)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</div>
                                    <div className={`text-xs px-3 py-1 rounded-full font-black uppercase border ${selectedOrder?.payment?.status === 'PAID'
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {selectedOrder?.payment?.status || '-'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set((selectedOrder?.payment?.sources || []).map((s: any) => String(s?.name || "").trim()).filter(Boolean))).map((name: any) => (
                                    <span key={name} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-600">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedOrder(null)}
                            className="flex-1 font-black uppercase tracking-widest text-[10px] cursor-pointer text-gray-400 hover:text-gray-900"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}