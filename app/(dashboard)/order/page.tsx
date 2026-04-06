"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getOrders, updateOrderStatus } from "@/lib/order-api";
import { useSocketOrders } from "@/hooks/useSocketOrders";
import { toast } from "react-toastify";
import { Maximize2, Minimize2, Loader2 } from "lucide-react";

// Local Components
import { StatusColumn } from "./_components/StatusColumn";
import { OrderDetailDialog } from "./_components/OrderDetailDialog";

export default function OrderBaruPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [updating, setUpdating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            if (!document.fullscreenElement) {
                if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Error toggling fullscreen:", err);
            setIsSimulatedFullscreen(!isSimulatedFullscreen);
        }
    };

    const ORDER_STATUSES = ["ORDERED", "PROCESSING", "READY", "SERVED", "CANCELLED"];
    const PRODUCT_STATUSES = ["ORDERED", "PROCESSING", "READY", "SERVED"];

    const getNextStatus = (currentStatus: string, allowedStatuses: string[]) => {
        const currentIndex = allowedStatuses.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === allowedStatuses.length - 1) return currentStatus;
        return allowedStatuses[currentIndex + 1];
    };

    const handleUpdateStatus = async (order: any) => {
        if (!order) return;
        const currentStatus = order.status || "ORDERED";
        const nextStatus = getNextStatus(currentStatus, ORDER_STATUSES);
        if (nextStatus === currentStatus) return;

        try {
            setUpdating(true);
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
            const json = await getOrders();
            setData(json);
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handleProductStatusChange = async (order: any, productId: number) => {
        const products = Array.isArray(order?.products) ? order.products : [];
        const product = products.find((p: any) => p.id === productId);
        const currentStatus = product?.status || "ORDERED";
        const nextStatus = getNextStatus(currentStatus, PRODUCT_STATUSES);

        const updatedProducts = products.map((p: any) =>
            p.id === productId ? { ...p, status: nextStatus } : p
        );

        const getComputedStatus = (productList: any[]) => {
            if (productList.length === 0) return "ORDERED";
            const s = productList.map((p: any) => (p.status || "ORDERED").toUpperCase());
            if (s.every((x: any) => x === "SERVED")) return "SERVED";
            if (s.some((x: any) => x === "ORDERED")) return "ORDERED";
            if (s.some((x: any) => x === "PROCESSING")) return "PROCESSING";
            if (s.some((x: any) => x === "READY")) return "READY";
            return "ORDERED";
        };

        const nextOrderStatus = getComputedStatus(updatedProducts);

        try {
            setUpdating(true);
            const allProductUpdates = updatedProducts.map((p: any) => ({ id: p.id, status: p.status }));
            await updateOrderStatus({
                order_number: order.order_number,
                status: nextOrderStatus,
                products: allProductUpdates,
            });

            toast.success("Product updated");
            setSelectedOrder({ ...order, status: nextOrderStatus, products: updatedProducts });
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

    const initialOrders = useMemo(() => {
        const rawRows = data?.rows || [];
        const now = new Date();
        const todayStr = now.toLocaleDateString("en-CA");

        return rawRows.filter((o: any) => {
            // Cek berbagai kemungkinan nama field tanggal dari backend/socket
            const timestamp = o.created || o.created_at || o.updated_at || o.updated;
            if (!timestamp) return false;

            const orderDate = new Date(timestamp).toLocaleDateString("en-CA");
            return orderDate === todayStr;
        });
    }, [data]);

    const { orders: rows, isConnected } = useSocketOrders(initialOrders);

    const getEffectiveStatus = (order: any) => {
        if (order?.status?.toUpperCase() === "CANCELLED") return "CANCELLED";
        const products = Array.isArray(order?.products) ? order.products : [];
        if (products.length === 0) return order?.status?.toUpperCase() || "ORDERED";
        const s = products.map((p: any) => (p.status || "ORDERED").toUpperCase());
        if (s.every((x: any) => x === "SERVED")) return "SERVED";
        if (s.some((x: any) => x === "ORDERED")) return "ORDERED";
        if (s.some((x: any) => x === "PROCESSING")) return "PROCESSING";
        if (s.some((x: any) => x === "READY")) return "READY";
        return "ORDERED";
    };

    const filterOrders = (status: string) => {
        return rows.filter((o: any) => getEffectiveStatus(o) === status.toUpperCase())
                   .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    };

    // Helper Formatters
    const formatRupiah = (n?: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
    const formatTanggalPesan = (iso?: string) => iso ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "-";
    const formatJam = (iso?: string) => iso ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : "-";
    const getTotalItems = (order: any) => (order?.products || []).reduce((sum: number, p: any) => sum + Number(p.variants?.[0]?.quantity || p.quantity || p.qty || 0), 0);

    const activeFullscreen = isFullscreen || isSimulatedFullscreen;

    return (
        <div ref={containerRef} className={`relative bg-white overflow-hidden flex flex-col select-none transition-all duration-300 ${activeFullscreen ? "h-screen w-screen p-4" : "h-screen rounded-xl shadow-sm border border-gray-100 mb-6"}`}>
            <div className="absolute bottom-4 right-4 z-50 flex items-center gap-1.5 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-none shadow-lg border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-[8px] font-black text-white tracking-[0.2em] uppercase">{isConnected ? 'LIVE' : 'OFF'}</span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Memuat data pesanan...</p>
                </div>
            ) : (
                <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                    {["ORDERED", "PROCESSING", "READY", "SERVED"].map((status, i) => (
                        <StatusColumn
                            key={status}
                            title={status}
                            count={filterOrders(status).length}
                            orders={filterOrders(status)}
                            bgColor={status === "ORDERED" ? "bg-blue-50" : status === "PROCESSING" ? "bg-amber-50" : status === "READY" ? "bg-green-50" : "bg-indigo-50"}
                            headerBgColor={status === "ORDERED" ? "bg-blue-600" : status === "PROCESSING" ? "bg-amber-500" : status === "READY" ? "bg-green-600" : "bg-indigo-600"}
                            textColor={status === "ORDERED" ? "#2563eb" : status === "PROCESSING" ? "#f59e0b" : status === "READY" ? "#16a34a" : "#4f46e5"}
                            formatJam={formatJam}
                            getTotalItems={getTotalItems}
                            onOrderClick={setSelectedOrder}
                        />
                    ))}

                    <StatusColumn
                        title="CANCELLED"
                        count={filterOrders("CANCELLED").length}
                        orders={filterOrders("CANCELLED")}
                        bgColor="bg-red-50"
                        headerBgColor="bg-red-600"
                        textColor="#dc2626"
                        formatJam={formatJam}
                        getTotalItems={getTotalItems}
                        onOrderClick={setSelectedOrder}
                        rightAction={
                            <button onClick={toggleFullscreen} className="p-1 hover:bg-white/20 rounded transition-colors text-white cursor-pointer">
                                {activeFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                            </button>
                        }
                    />
                </div>
            )}

            <OrderDetailDialog
                selectedOrder={selectedOrder}
                updating={updating}
                onClose={() => setSelectedOrder(null)}
                containerRef={containerRef}
                getEffectiveStatus={getEffectiveStatus}
                handleUpdateStatus={handleUpdateStatus}
                formatTanggalPesan={formatTanggalPesan}
                formatRupiah={formatRupiah}
                handleProductStatusChange={handleProductStatusChange}
            />
        </div>
    );
}
