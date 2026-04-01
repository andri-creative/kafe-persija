"use client";

import Image from "next/image";
import { User, ShoppingCart, Utensils, Trash2, Minus, Plus, QrCode, Banknote, Printer, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { CartItem } from "../types";

interface Discount {
    id: string;
    label: string;
    value: number;
    type: 'fixed' | 'percent';
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
    paymentMethod,
    onPaymentMethodChange,
    cashReceived,
    onCashReceivedChange,
    isSubmitting,
    onPayment
}: OrderSummaryProps) {
    const currentDiscount = discounts.find(d => d.id === selectedDiscountId);
    const discountAmount = cartTotal - finalTotal;
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
                    <div className="flex justify-between items-center text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                        <span>Recipient</span>
                        <span className="text-slate-900 font-bold truncate max-w-[120px] text-right">
                            {customerName || "-"}
                        </span>
                    </div>
                </div>

                {/* Customer Name Input - MANDATORY */}
                <div className="mb-4 px-1">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff3535] transition-colors">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            placeholder="NAMA PESANAN..."
                            value={customerName}
                            onChange={(e) => onCustomerNameChange(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border border-slate-100 rounded-md py-2 pl-8 pr-4 text-[9px] font-bold uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-[#ff3535] transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-dashed border-slate-200 mb-4" />

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 italic">
                            <ShoppingCart className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-3 group">
                                {/* Item Image */}
                                <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                                    {item.image ? (
                                        <Image
                                            src={getVariantImageUrl(item.image)}
                                            alt={item.productName}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : <Utensils className="w-6 h-6 text-slate-200" />}
                                </div>

                                {/* Item Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex items-center gap-1.5 justify-between">
                                            <h5 className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-tight leading-tight flex-1">
                                                {item.productName}
                                            </h5>
                                            <span className="text-[9px] font-bold text-slate-400">x{item.quantity}</span>
                                        </div>
                                        <p className="text-[7px] font-medium text-slate-400 uppercase truncate mt-0.5">{item.variantDesc}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <span className="text-[10px] font-black text-[#ff3535]">Rp {item.price.toLocaleString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-100/50 p-0.5 rounded-lg">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, -1)}
                                                className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-white hover:text-[#ff3535] shadow-sm active:scale-90 transition-all"
                                            >
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className="text-[10px] font-bold w-3 text-center text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, 1)}
                                                className="w-5 h-5 rounded-md bg-[#ff3535] flex items-center justify-center text-white hover:bg-red-600 shadow-sm active:scale-90 transition-all border border-red-700"
                                            >
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Summary */}
                <div className="flex-none space-y-4">
                    {/* Discounts */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <h4 className="text-[11px] font-bold text-slate-900">Applied Discount</h4>
                        </div>
                        <select
                            value={selectedDiscountId}
                            onChange={(e) => onDiscountChange(e.target.value)}
                            className="w-full bg-amber-50/50 border border-amber-100 rounded-lg py-2 px-3 text-[10px] font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all uppercase tracking-tight"
                        >
                            {discounts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.label} {d.value > 0 ? `(${d.type === 'percent' ? `${d.value}%` : `Rp ${d.value.toLocaleString()}`})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t border-dashed border-slate-200 my-2" />

                    {/* Payment Summary */}
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-900">Payment Summary</h4>
                        <div className="space-y-1.5 px-0.5">
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                <span>Sub Total</span>
                                <span className="text-slate-900">Rp {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-medium text-amber-600 uppercase tracking-tighter">
                                <span>Discount ({currentDiscount?.label})</span>
                                <span>- Rp {discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-900 uppercase">Total Bill</span>
                                <span className="text-xs font-black text-[#ff3535] tracking-tighter">
                                    Rp {finalTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200 my-2" />

                    {/* Payment Method */}
                    <div className="space-y-3">
                        <h4 className="text-[12px] font-medium text-slate-900">Payment Method</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'netzme', label: 'Netzme', icon: QrCode },
                                { id: 'cash', label: 'Cash', icon: Banknote },
                            ].map((m) => {
                                const Icon = m.icon;
                                const isSelected = paymentMethod === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => onPaymentMethodChange(m.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1.5 py-0.8 rounded-xl border transition-all duration-200",
                                            isSelected
                                                ? "bg-red-50 border-red-200 text-[#ff3535] shadow-sm"
                                                : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", isSelected ? "text-[#ff3535]" : "text-slate-400")} />
                                        <span className="text-[7px] font-bold uppercase tracking-widest">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="space-y-2 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Uang Tunai</span>
                                        {typeof cashReceived === 'number' && cashReceived > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Kembali:</span>
                                                <span className="text-[9px] font-bold text-[#ff3535]">Rp {Math.max(0, cashReceived - finalTotal).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) => onCashReceivedChange(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="NOMINAL..."
                                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ff3535] transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2.5 mt-2">
                        <button
                            className="flex-1 py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-200"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print
                        </button>
                        <button
                            onClick={onPayment}
                            disabled={cart.length === 0 || !customerName || isSubmitting}
                            className="flex-2 py-3 bg-[#ff3535] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Zap className="w-3.5 h-3.5 fill-white" />
                            )}
                            {isSubmitting ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
