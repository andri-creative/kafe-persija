"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getOrders } from "@/lib/order-api";
import { useSocketOrders } from "@/hooks/useSocketOrders";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LayarTv({ role = "STAFF" }: { role?: "ADMIN" | "STAFF" | "MANAGER" }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);


    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

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

    const getOrdersByProductStatus = (status: string) => {
        return rows.map((order: any) => {
            const products = Array.isArray(order?.products) ? order.products : [];
            const filteredProducts = products.filter((p: any) => {
                const itemStatus = p.status || "ORDERED";
                return itemStatus.toUpperCase() === status.toUpperCase();
            });

            if (filteredProducts.length === 0) return null;
            return {
                ...order,
                products: filteredProducts
            };
        })
            .filter(Boolean)
            .sort((a: any, b: any) => {
                const timeA = new Date(a.updated).getTime();
                const timeB = new Date(b.updated).getTime();
                return timeB - timeA;
            });
    };

    const orderBaru = getOrdersByProductStatus("ORDERED");
    const processing = getOrdersByProductStatus("PROCESSING");
    const ready = getOrdersByProductStatus("READY");

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

    const StatusColumn = ({
        title,
        count,
        orders,
        bgColor,
        headerColor,
        textColor,
        emptyText
    }: {
        title: string,
        count: number,
        orders: any[],
        bgColor: string,
        headerColor: string,
        textColor: string,
        emptyText: string
    }) => (
        <div className={`flex flex-col h-screen ${bgColor}`}>
            {/* Column Header */}
            <div className={`${headerColor} p-4 text-center shadow-sm z-10`}>
                <h2 className="text-2xl font-black text-white tracking-wide uppercase">{title}</h2>
                <div className="text-white/80 text-sm font-medium mt-1">
                    {count} ORDERS
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">
                        <div className="text-xl">Loading...</div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <div className="text-6xl mb-4">🍽️</div>
                        <div className="text-lg font-medium">{emptyText}</div>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-current" style={{ borderColor: textColor }}>
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-3 border-b pb-2 border-dashed border-gray-100">
                                <div>
                                    <div className="font-black text-2xl text-gray-800">#{order.order_number}</div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {order.table?.[0]?.no_table ? `TABLE ${order.table[0].no_table}` : "TAKE AWAY"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">TIME</div>
                                    <div className="text-sm font-mono text-gray-600">
                                        {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Product List - Simplified */}
                            <div className="space-y-2">
                                {(Array.isArray(order?.products) ? order.products : []).map((product: any, idx: number) => {
                                    const qty = product.variants?.[0]?.quantity || product.quantity || product.qty || 0;
                                    const productName = product.name || product.product_name || "-";
                                    return (
                                        <div key={idx} className="flex items-start text-sm">
                                            <div className={`font-bold mr-3 min-w-[24px] text-center ${qty > 1 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {qty}x
                                            </div>
                                            <div className="text-gray-700 font-medium leading-tight">
                                                {productName}
                                                {product.notes && <div className="text-[10px] text-gray-400 italic mt-0.5">"{product.notes}"</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <div>{getTotalItems(order)} Items</div>
                                <div className={`font-bold ${order.payment?.status === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                                    {order.payment?.status || 'UNPAID'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            onClick={toggleFullscreen}
            className="grid grid-cols-3 h-screen w-full overflow-hidden bg-gray-100 relative font-sans cursor-pointer select-none"
            title={isFullscreen ? "Klik untuk keluar Fullscreen" : "Klik untuk masuk Fullscreen"}
        >

            {/* Connection Status Indicator */}
            <div className="absolute top-2 right-2 z-[60] flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-none border border-white/10">
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'}`}></div>
                <span className="text-[10px] font-bold text-white tracking-wider uppercase opacity-90">
                    {isConnected ? 'LIVE' : 'DISCONNECTED'}
                </span>
            </div>

            <StatusColumn
                title="ORDERED"
                count={orderBaru.length}
                orders={orderBaru}
                bgColor="bg-blue-50"
                headerColor="bg-blue-600"
                textColor="#2563eb"
                emptyText="No new orders"
            />

            <StatusColumn
                title="PROCESSING"
                count={processing.length}
                orders={processing}
                bgColor="bg-orange-50"
                headerColor="bg-orange-500"
                textColor="#f97316"
                emptyText="No orders in process"
            />

            <StatusColumn
                title="READY"
                count={ready.length}
                orders={ready}
                bgColor="bg-green-50"
                headerColor="bg-green-600"
                textColor="#16a34a"
                emptyText="No ready orders"
            />
        </div>
    );
}