"use client";

import Image from "next/image";
import { UtensilsCrossed, Utensils, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { Product } from "../types";

interface ProductGridProps {
    products: Product[];
    onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
    return (
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden pt-1">
            <div className="flex items-center gap-2 px-1 shrink-0">
                <span className="text-[9px] font-black text-slate-800 dark:text-zinc-100 uppercase tracking-[0.2em]">Menu Items</span>
                <div className="h-px flex-1 bg-slate-200/60 dark:bg-zinc-800"></div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pr-0.5">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 opacity-10 italic">
                        <UtensilsCrossed className="w-6 h-6 mb-1" />
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">Belum ada produk...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 gap-2">
                        {products
                            .filter((p: Product) => p.status === "active" || p.status === "Non Stok")
                            .map((product: Product) => {
                                const activeVariants = product.product_variants.filter(v => !v.status);
                                if (activeVariants.length === 0) return null;

                                const variant = activeVariants[0];
                                const images = variant?.product_variant_images || [];
                                
                                // Overall stock check
                                const totalStock = activeVariants.reduce((sum, v) => sum + (v.stok || 0), 0);
                                const isOutOfStock = product.status === "Non Stok" || totalStock <= 0;

                                return (
                                    <Card
                                        key={product.id}
                                        onClick={() => !isOutOfStock && onProductClick(product)}
                                        className={`group p-2 border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300 rounded-2xl bg-white dark:bg-zinc-900/70 overflow-hidden ${isOutOfStock ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'hover:shadow-xl hover:border-slate-200 dark:hover:border-zinc-700 cursor-pointer active:scale-95'}`}
                                    >
                                        <div className="space-y-2.5 relative">
                                            {/* Sold Out Overlay */}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 shadow-xl rotate-12">
                                                        Sold Out
                                                    </div>
                                                </div>
                                            )}

                                            {/* Image Container - Square & Clean */}
                                            <div className="relative aspect-square w-full rounded-xl bg-slate-50 dark:bg-zinc-800/50 overflow-hidden flex items-center justify-center group-hover:bg-red-50/30 dark:group-hover:bg-red-900/10 transition-colors">
                                                {images.length > 1 ? (
                                                    <Carousel
                                                        className="w-full h-full"
                                                        opts={{ loop: true }}
                                                        plugins={[Autoplay({ delay: 3000 + (Math.random() * 1000) })]}
                                                    >
                                                        <CarouselContent className="ml-0 h-full">
                                                            {images.map((img, i) => (
                                                                <CarouselItem key={i} className="pl-0 relative aspect-square">
                                                                    <Image
                                                                        src={getVariantImageUrl(img.image)}
                                                                        alt={`${product.name} ${i}`}
                                                                        fill
                                                                        className="object-contain p-2 transition-transform duration-700 group-hover:scale-110 rounded-xl"
                                                                        unoptimized
                                                                    />
                                                                </CarouselItem>
                                                            ))}
                                                        </CarouselContent>
                                                    </Carousel>
                                                ) : images.length === 1 ? (
                                                    <Image
                                                        src={getVariantImageUrl(images[0].image)}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <Utensils className="w-6 h-6 text-slate-200" />
                                                )}
                                            </div>

                                            {/* Content - Compact & High Contrast */}
                                            <div className="px-1 space-y-1 pb-1">
                                                <h5 className="text-[11px] font-black text-slate-900 dark:text-zinc-100 truncate leading-tight uppercase tracking-tight group-hover:text-[#ff3535] transition-colors">{product.name}</h5>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-[#ff3535] tracking-tighter">
                                                        Rp {variant?.price?.toLocaleString() || 0}
                                                    </span>
                                                    {!isOutOfStock && (
                                                        <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center group-hover:bg-[#ff3535] group-hover:border-[#ff3535] group-hover:rotate-90 transition-all duration-300">
                                                            <LayoutGrid className="w-2.5 h-2.5 text-slate-300 dark:text-zinc-600 group-hover:text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}
