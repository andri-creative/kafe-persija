"use client";

import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Utensils, X } from "lucide-react";
import Image from "next/image";

interface DBVariant {
    id: number;
    desc: string | null;
    price: number;
    status: boolean;
    stok: number | null;
    product_variant_images: {
        image: string;
    }[];
}

interface DBProduct {
    id: number;
    name: string;
    description: string | null;
    status: string;
    product_category_trx: {
        product_category: {
            id: number;
            name: string;
        };
    }[];
    product_variants: DBVariant[];
}

interface CartItem {
    id: number;
    variantId: number;
    quantity: number;
}

interface VariantSelectorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: DBProduct | null;
    cart: CartItem[];
    onSelect: (product: DBProduct, variant: DBVariant) => void;
}

export function VariantSelector({ isOpen, onOpenChange, product, cart, onSelect }: VariantSelectorProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 rounded-3xl gap-0">
                <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    {product.product_variants[0]?.product_variant_images[0]?.image ? (
                        <Image
                            src={product.product_variants[0].product_variant_images[0].image.startsWith('/')
                                ? product.product_variants[0].product_variant_images[0].image
                                : `/images/variant/${product.product_variants[0].product_variant_images[0].image}`}
                            alt={product.name}
                            fill
                            className="object-cover"
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
                            {product.product_variants.map((variant) => {
                                const currentInCart = cart.find(item => item.variantId === variant.id)?.quantity || 0;
                                const isUnlimited = variant.stok === null;
                                const remainingStock = isUnlimited ? 99 : variant.stok! - currentInCart;
                                const isAvailable = variant.status && remainingStock > 0;

                                return (
                                    <button
                                        key={variant.id}
                                        disabled={!isAvailable}
                                        onClick={() => onSelect(product, variant)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group active:scale-[0.98]",
                                            isAvailable
                                                ? "border-zinc-100 dark:border-zinc-800 hover:border-[#ff3535] hover:bg-red-50/30 dark:hover:bg-red-950/10 cursor-pointer"
                                                : "opacity-50 grayscale cursor-not-allowed border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        )}
                                    >
                                        <div className="flex flex-col items-start gap-0.5">
                                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                                {variant.desc || "Standard Variant"}
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
                                            <span className="text-sm font-black text-[#ff3535]">
                                                Rp {variant.price.toLocaleString('id-ID')}
                                            </span>
                                            <div className={cn(
                                                "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                                isAvailable
                                                    ? "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[#ff3535] group-hover:text-white"
                                                    : "bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-300"
                                            )}>
                                                <span className="text-xl font-bold">+</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:text-zinc-900 dark:hover:text-zinc-100 h-10 rounded-xl"
                    >
                        Tutup Panel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
