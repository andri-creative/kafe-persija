"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrderDetailDialogProps {
    selectedOrder: any;
    updating: boolean;
    onClose: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    getEffectiveStatus: (order: any) => string;
    handleUpdateStatus: (order: any) => void;
    formatTanggalPesan: (iso?: string) => string;
    formatRupiah: (n?: number) => string;
    handleProductStatusChange: (order: any, productId: number) => void;
}

export function OrderDetailDialog({
    selectedOrder,
    updating,
    onClose,
    containerRef,
    getEffectiveStatus,
    handleUpdateStatus,
    formatTanggalPesan,
    formatRupiah,
    handleProductStatusChange
}: OrderDetailDialogProps) {
    if (!selectedOrder) return null;

    return (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-xl bg-gray-50 border-0 shadow-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col"
                container={containerRef.current || undefined}
            >
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
                                    className={`text-xs px-4 py-2 rounded-xl border cursor-pointer font-black transition-all shadow-sm active:scale-95 ${getEffectiveStatus(selectedOrder) === "ORDERED"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : getEffectiveStatus(selectedOrder) === "PROCESSING"
                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                            : getEffectiveStatus(selectedOrder) === "READY"
                                                ? "bg-green-100 text-green-700 border-green-200"
                                                : getEffectiveStatus(selectedOrder) === "SERVED"
                                                    ? "bg-indigo-100 text-indigo-700 border-indigo-200 cursor-not-allowed"
                                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                    disabled={updating || getEffectiveStatus(selectedOrder) === "SERVED" || selectedOrder?.status === "CANCELLED"}
                                    onClick={() => handleUpdateStatus(selectedOrder)}
                                >
                                    {getEffectiveStatus(selectedOrder)}
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
                        onClick={onClose}
                        className="flex-1 font-black uppercase tracking-widest text-[10px] cursor-pointer text-gray-400 hover:text-gray-900"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
