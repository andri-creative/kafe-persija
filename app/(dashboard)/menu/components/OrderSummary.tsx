"use client";

import Image from "next/image";
import { User, ShoppingCart, Utensils, Trash2, Minus, Plus, QrCode, Banknote, Printer, Loader2, Zap, Gift, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { CartItem } from "../types";
import { useState } from "react";
import toast from "react-hot-toast";

interface Discount {
    id: string;
    label: string;
    value: number;
    type: 'fixed' | 'percent';
}

interface Promo {
    id: string;
    label: string;
    description?: string;
    code: string;
}

interface OrderSummaryProps {
    transactionId: string;
    customerName: string;
    onCustomerNameChange: (name: string) => void;
    cart: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    cartTotal: number;
    finalTotal: number;
    discounts: Discount[];
    selectedDiscountId: string;
    onDiscountChange: (id: string) => void;
    promos: Promo[];
    selectedPromoId: string;
    onPromoChange: (id: string) => void;
    paymentMethod: string;
    onPaymentMethodChange: (method: string) => void;
    cashReceived: number | "";
    onCashReceivedChange: (value: number | "") => void;
    isSubmitting: boolean;
    onPayment: () => void;
}

export function OrderSummary({
    transactionId,
    customerName,
    onCustomerNameChange,
    cart,
    onUpdateQuantity,
    onRemoveItem,
    cartTotal,
    finalTotal,
    discounts,
    selectedDiscountId,
    onDiscountChange,
    promos = [],
    selectedPromoId = "",
    onPromoChange,
    paymentMethod,
    onPaymentMethodChange,
    cashReceived,
    onCashReceivedChange,
    isSubmitting,
    onPayment
}: OrderSummaryProps) {
    const [activeTab, setActiveTab] = useState<'discount' | 'promo'>(selectedPromoId ? 'promo' : 'discount');
    const [promoInput, setPromoInput] = useState(selectedPromoId ? (promos.find(p => p.id === selectedPromoId)?.code || "") : "");

    const currentDiscount = discounts.find(d => d.id === selectedDiscountId);
    const currentPromo = promos.find(p => p.id === selectedPromoId);
    const discountAmount = cartTotal - finalTotal;

    const handleTabChange = (tab: 'discount' | 'promo') => {
        setActiveTab(tab);
        // Reset the other selection when switching tabs to maintain mutual exclusion
        if (tab === 'discount') {
            onPromoChange("");
        } else {
            onDiscountChange("");
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-xl p-4 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="space-y-1 mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>
                    <div className="flex justify-between items-center text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                        <span>Transaction ID</span>
                        <span className="text-slate-900 font-bold">#{transactionId}</span>
                    </div>
                </div>

                {/* Customer Name Input */}
                <div className="mb-4">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff3535] transition-colors">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            placeholder="NAMA PESANAN..."
                            value={customerName}
                            onChange={(e) => onCustomerNameChange(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-100 rounded-md py-2 pl-8 pr-4 text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3535] transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-dashed border-slate-200 mb-4" />

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-20 italic">
                            <ShoppingCart className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-3 group">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                                    {item.image ? (
                                        <Image
                                            src={getVariantImageUrl(item.image)}
                                            alt={item.productName}
                                            width={40}
                                            height={40}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : <Utensils className="w-6 h-6 text-slate-200" />}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="flex items-center gap-1.5 justify-between">
                                        <h5 className="text-[10px] font-bold text-slate-900 truncate uppercase leading-none">
                                            {item.productName}
                                        </h5>
                                        <span className="text-[9px] font-bold text-slate-400 shrink-0">x{item.quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onRemoveItem(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <span className="text-[10px] font-black text-[#ff3535]">Rp {item.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg">
                                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-4 h-4 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-600"><Minus className="w-2 h-2" /></button>
                                            <span className="text-[9px] font-bold w-3 text-center">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-4 h-4 rounded-md bg-[#ff3535] flex items-center justify-center text-white"><Plus className="w-2 h-2" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section - Compact Benefit UI */}
                <div className="flex-none space-y-3 mt-4 pt-4 border-t border-slate-100">
                    {/* Benefit Tab Selector */}
                    <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => handleTabChange('discount')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                                activeTab === 'discount' ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Zap className={cn("w-3 h-3", activeTab === 'discount' ? "fill-amber-500 text-amber-500" : "")} />
                            Discount
                        </button>
                        <button
                            onClick={() => handleTabChange('promo')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                                activeTab === 'promo' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Ticket className={cn("w-3 h-3", activeTab === 'promo' ? "fill-blue-500 text-blue-500" : "")} />
                            Promo
                        </button>
                    </div>

                    {/* Dropdown for active tab */}
                    <div className="px-0.5">
                        {activeTab === 'discount' ? (
                            <select
                                value={selectedDiscountId}
                                onChange={(e) => onDiscountChange(e.target.value)}
                                className="w-full bg-amber-50 border border-amber-100 rounded-lg py-2 px-3 text-[10px] font-bold text-amber-700 outline-none uppercase tracking-tight"
                            >
                                {discounts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.label} {d.value > 0 ? `(${d.type === 'percent' ? `${d.value}%` : `Rp ${d.value.toLocaleString()}`})` : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex gap-1.5 px-0.5">
                                <div className="relative flex-1">
                                    <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-400" />
                                    <input
                                        type="text"
                                        placeholder="KODE PROMO..."
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                        className="w-full bg-blue-50 border border-blue-100 rounded-lg py-2 pl-8 pr-3 text-[10px] font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-blue-300 uppercase tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const found = promos.find(p => p.code === promoInput);
                                        if (found) {
                                            onPromoChange(found.id);
                                            toast.success(`PROMO ${found.label} BERHASIL DIPASANG!`, {
                                                icon: '🔥',
                                                style: {
                                                    borderRadius: '10px',
                                                    background: '#1e40af',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                },
                                            });
                                        } else {
                                            onPromoChange(""); // Reset if not found
                                            toast.error("KODE PROMO TIDAK DITEMUKAN!", {
                                                style: {
                                                    borderRadius: '10px',
                                                    background: '#991b1b',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                },
                                            });
                                        }
                                    }}
                                    className="px-3 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Compact Summary */}
                    <div className="space-y-1.5 px-1 py-2 bg-slate-50/50 rounded-xl">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                            <span>Sub Total</span>
                            <span className="text-slate-700">Rp {cartTotal.toLocaleString()}</span>
                        </div>
                        {(currentDiscount || currentPromo) && (
                            <div className="flex justify-between items-center text-[9px] font-bold text-emerald-600 uppercase">
                                <span>Benefit ({currentDiscount?.label || currentPromo?.label})</span>
                                <span>- Rp {discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-900 uppercase">Total Bill</span>
                            <span className="text-sm font-black text-[#ff3535]">Rp {finalTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Method Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'netzme', label: 'Netzme', icon: QrCode },
                            { id: 'cash', label: 'Cash', icon: Banknote },
                        ].map((m) => {
                            const isSelected = paymentMethod === m.id;
                            return (
                                <button
                                    key={m.id} onClick={() => onPaymentMethodChange(m.id)}
                                    className={cn("flex flex-col items-center py-2 rounded-xl border-2 transition-all", isSelected ? "bg-red-50 border-[#ff3535] text-[#ff3535]" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}
                                >
                                    <m.icon className="w-4 h-4 mb-1" />
                                    <span className="text-[7px] font-bold uppercase tracking-widest">{m.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Cash Amount</span>
                                {typeof cashReceived === 'number' && cashReceived >= finalTotal && (
                                    <span className="text-[8px] font-bold text-emerald-600">Change: Rp {(cashReceived - finalTotal).toLocaleString()}</span>
                                )}
                            </div>
                            <input
                                type="number" value={cashReceived} onChange={(e) => onCashReceivedChange(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="NOMINAL..." className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-900 outline-none focus:border-[#ff3535]"
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold text-[9px] uppercase tracking-widest border border-slate-200">Print</button>
                        <button
                            onClick={onPayment} disabled={cart.length === 0 || !customerName || isSubmitting}
                            className="flex-2 py-3 bg-[#ff3535] text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-white" />}
                            {isSubmitting ? "Wait..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
