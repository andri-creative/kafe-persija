"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus, Trash2, Utensils, Loader2 } from "lucide-react";
import Image from "next/image";
import { getVariantImageUrl } from "@/lib/variant-helper";

import { useState } from "react";

interface CartItem {
    id: number;
    variantId: number;
    name: string;
    variantName: string | null;
    price: number;
    quantity: number;
    image: string | null;
}

interface Discount {
    id: number;
    name: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
}

interface OrderSidebarProps {
    cart: CartItem[];
    onUpdateQuantity: (variantId: number, delta: number) => void;
    onRemoveItem: (variantId: number) => void;
    onConfirm: (customerName: string, selectedDiscount: Discount | null, cashAmount: number) => void;
    isLoading?: boolean;
    discounts: Discount[];
}

export function OrderSidebar({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onConfirm,
    isLoading = false,
    discounts = []
}: OrderSidebarProps) {
    const [customerName, setCustomerName] = useState("");
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
    const [cashAmount, setCashAmount] = useState<number>(0);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const selectedDiscount = discounts.find(d => d.id === selectedDiscountId) || null;
    const discountValue = selectedDiscount
        ? selectedDiscount.type === "PERCENTAGE"
            ? (selectedDiscount.value / 100) * subtotal
            : selectedDiscount.value
        : 0;

    const total = Math.max(0, subtotal - discountValue);
    const change = Math.max(0, cashAmount - total);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 space-y-4 pt-8">
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    Detail Pesanan
                </h2>

                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-wider pl-1 font-black">Nama Pelanggan</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Darius Sinarmulia"
                            className="w-full h-10 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest italic">Menu Dipesan</h3>
                        <span className="text-[11px] font-black text-zinc-400">{cart.length} Item</span>
                    </div>

                    {cart.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl gap-2 opacity-50">
                            <Trash2 className="h-6 w-6 text-zinc-300" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Keranjang Kosong</span>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.variantId}`} className="flex gap-4 group animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-800 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-800 relative">
                                    {item.image ? (
                                        <Image
                                            src={getVariantImageUrl(item.image)}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Utensils className="h-6 w-6 text-zinc-300 opacity-50" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 py-0.5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 shrink-0">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        {item.variantName && (
                                            <span className="text-[8px] font-black bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 w-fit uppercase tracking-tighter mt-1">
                                                {item.variantName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <p className="text-[10px] font-black text-zinc-400">Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.variantId, -1)}
                                                    className="h-6 w-6 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.variantId, 1)}
                                                    className="h-6 w-6 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(item.variantId)}
                                                className="h-7 w-7 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* DISCOUNTS SECTION */}
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest italic">Pilih Diskon</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedDiscountId(null)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-[10px] font-black transition-all",
                                selectedDiscountId === null
                                    ? "bg-[#ff3535] text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                            )}
                        >
                            TIDAK ADA
                        </button>
                        {discounts.map((discount) => (
                            <button
                                key={discount.id}
                                onClick={() => setSelectedDiscountId(discount.id)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-[10px] font-black transition-all",
                                    selectedDiscountId === discount.id
                                        ? "bg-[#ff3535] text-white"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                )}
                            >
                                {discount.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PAYMENT METHOD SECTION */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest italic">Pembayaran Tunai (Cash)</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-400 uppercase font-black pl-1">Uang Diterima (Cash)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400">Rp</span>
                                <input
                                    type="number"
                                    value={cashAmount || ""}
                                    onChange={(e) => setCashAmount(Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full h-11 pl-9 pr-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        {cashAmount > 0 && (
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-zinc-400 uppercase">Kembalian</span>
                                <span className="text-sm font-black text-green-500">
                                    Rp {change.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 space-y-4 shadow-[0_-8px_32px_rgba(0,0,0,0.02)]">
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                        <span>Subtotal</span>
                        <span className="text-zinc-900 dark:text-zinc-100">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {selectedDiscount && (
                        <div className="flex justify-between text-[11px] font-bold text-green-500">
                            <span>Diskon ({selectedDiscount.name})</span>
                            <span>-Rp {discountValue.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-black text-zinc-900 dark:text-zinc-100 pt-3 mt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Total Akhir</span>
                        <span className="text-[#ff3535]">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <Button
                    onClick={() => onConfirm(customerName, selectedDiscount, cashAmount)}
                    disabled={isLoading || cart.length === 0 || (cashAmount < total && total > 0)}
                    className="w-full h-12 bg-[#ff3535] hover:bg-[#e62e2e] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_8px_16px_-4px_rgba(255,53,53,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        "Bayar Sekarang"
                    )}
                </Button>
            </div>
        </div>
    );
}
