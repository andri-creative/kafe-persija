"use client";

import Image from "next/image";
import { Utensils, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { Product, ProductVariant, CartItem } from "../types";

interface ProductVariantDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    selectedVariant: ProductVariant | null;
    onSelectVariant: (variant: ProductVariant) => void;
    onAddToCart: (product: Product, variant: ProductVariant) => void;
    cart: CartItem[];
}

export function ProductVariantDialog({
    isOpen,
    onOpenChange,
    product,
    selectedVariant,
    onSelectVariant,
    onAddToCart,
    cart
}: ProductVariantDialogProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 rounded-3xl gap-0">
                <div className="flex flex-col">
                    {/* Header Section */}
                    <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {selectedVariant?.product_variant_images[0]?.image ? (
                            <Image
                                src={getVariantImageUrl(selectedVariant.product_variant_images[0].image)}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-110"
                                unoptimized
                            />
                        ) : (
                            <Utensils className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-[#ff3535] text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest w-fit mb-2">
                                Pilihan Varian
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1">
                                {product.name}
                            </h2>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide line-clamp-1 mt-0.5">
                                {product.description || "Silakan pilih salah satu varian menu"}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="grid gap-3">
                                {product.product_variants
                                    .filter((v) => !v.status)
                                    .map((variant) => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        const currentInCart = cart.find(item => item.variantId === variant.id)?.quantity || 0;
                                        const isUnlimited = variant.stok === null;
                                        const remainingStock = isUnlimited ? 99 : variant.stok! - currentInCart;
                                        const isAvailable = remainingStock > 0;

                                        return (
                                            <button
                                                key={variant.id}
                                                disabled={!isAvailable}
                                                onClick={() => onSelectVariant(variant)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group active:scale-[0.98]",
                                                    !isAvailable
                                                        ? "opacity-50 grayscale cursor-not-allowed border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50"
                                                        : isSelected
                                                            ? "border-[#ff3535] bg-red-50/30 dark:bg-red-950/10"
                                                            : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                                                )}
                                            >
                                                <div className="flex flex-col items-start gap-0.5 text-left">
                                                    <span className={cn(
                                                        "text-xs font-black uppercase tracking-tight",
                                                        isSelected ? "text-[#ff3535]" : "text-zinc-900 dark:text-zinc-100"
                                                    )}>
                                                        {variant.desc || "Varian Standar"}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase tracking-widest",
                                                            isAvailable ? "text-zinc-400" : "text-red-500"
                                                        )}>
                                                            {isAvailable ? "Tersedia" : "Stok Habis"}
                                                        </span>
                                                        {!isUnlimited && isAvailable && (
                                                            <span className="text-[9px] font-bold text-[#ff3535] bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded-md uppercase">
                                                                Stok: {remainingStock}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-sm font-black",
                                                        isSelected ? "text-[#ff3535]" : "text-zinc-900 dark:text-zinc-100"
                                                    )}>
                                                        Rp {variant.price.toLocaleString('id-ID')}
                                                    </span>
                                                    <div className={cn(
                                                        "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                                        !isAvailable
                                                            ? "bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-300"
                                                            : isSelected
                                                                ? "bg-[#ff3535] text-white shadow-lg shadow-red-500/20"
                                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-[#ff3535] group-hover:text-white"
                                                    )}>
                                                        <Plus className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => selectedVariant && onAddToCart(product, selectedVariant)}
                                className="flex-2 h-12 bg-[#ff3535] hover:bg-[#e62e2e] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            >
                                Tambah Pesanan
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
