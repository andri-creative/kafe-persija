"use client";

import { cn } from "@/lib/utils";
import {
    Coffee,
    CupSoda,
    IceCream,
    Pizza,
    Utensils,
    Beef,
    Plus,
    Search,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";

import { OrderSidebar } from "../../_components/OrderSidebar";
import { VariantSelector } from "../../_components/VariantSelector";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { useSession } from "next-auth/react";



interface CartItem {
    id: number; // For product context
    variantId: number;
    name: string;
    variantName: string | null;
    price: number;
    quantity: number;
    image: string | null;
}

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

interface DBCategory {
    id: number;
    name: string;
    image: string | null;
}

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState<number | "all">("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [products, setProducts] = useState<DBProduct[]>([]);
    const [categories, setCategories] = useState<DBCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedProductForVariant, setSelectedProductForVariant] = useState<DBProduct | null>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const { data: session } = useSession();

    const fetchData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axios.get("/api/products"),
                axios.get("/api/categories")
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error("Failed to fetch menu data:", error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(false);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const filteredProducts = products
        .filter(p => p.status.toLowerCase() === "active")
        .map(p => ({
            ...p,
            product_variants: p.product_variants.filter(v => 
                (v.stok === null || v.stok > 0) && !v.status
            )
        }))
        .filter(p => p.product_variants.length > 0)
        .filter(p => {
            const matchesCategory = activeCategory === "all" || p.product_category_trx.some(trx => trx.product_category.id === activeCategory);
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

    const addToCart = (product: DBProduct) => {
        if (product.product_variants.length > 1) {
            setSelectedProductForVariant(product);
            setIsVariantModalOpen(true);
            return;
        }

        const variant = product.product_variants[0];

        const currentInCart = cart.find(item => item.variantId === variant.id)?.quantity || 0;
        const availableStock = variant.stok === null ? 999 : variant.stok - currentInCart;

        if (variant.status || availableStock <= 0) {
            return; 
        }

        handleVariantAdd(product, variant);
    };

    const handleVariantAdd = (product: DBProduct, variant: DBVariant) => {
        setCart(prev => {
            const existing = prev.find(item => item.variantId === variant.id);

            const currentQty = existing?.quantity || 0;
            const availableStock = variant.stok === null ? 999 : variant.stok - currentQty;

            if (variant.status || availableStock <= 0) {
                return prev;
            }

            if (existing) {
                return prev.map(item =>
                    item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: product.id,
                variantId: variant.id,
                name: product.name,
                variantName: variant.desc,
                price: variant.price,
                quantity: 1,
                image: (variant.product_variant_images[0]?.image || null) as string | null
            }];
        });
        setIsVariantModalOpen(false);
    };

    const updateQuantity = (variantId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.variantId === variantId) {
                const product = products.find(p => p.id === item.id);
                const variant = product?.product_variants.find(v => v.id === variantId);

                if (delta > 0 && variant) {
                    const availableStock = variant.stok === null ? 999 : variant.stok;
                    if (item.quantity >= availableStock) return item;
                }

                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (variantId: number) => {
        setCart(prev => prev.filter(item => item.variantId !== variantId));
    };

    const getItemQuantity = (productId: number) => {
        return cart.filter(item => item.id === productId).reduce((acc, item) => acc + item.quantity, 0);
    };

    const handleConfirm = (customerName: string) => {
        if (!customerName) {
            alert("Silakan masukkan nama pelanggan");
            return;
        }

        // Generate Order Number: ORD-[Timestamp]-[Random3]
        const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        const orderData = {
            order_number: orderNumber,
            customer_name: customerName,
            items: cart,
            subtotal,
            taxes,
            total,
            status: "ORDERED",
            created_at: new Date().toISOString()
        };

        console.log("ORDER JSON:", orderData);
        alert(JSON.stringify(orderData, null, 2));
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxes = subtotal * 0.05;
    const total = subtotal + taxes;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff3535]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6 relative">
            <div className="flex flex-col gap-6 flex-1 min-h-0">
                <div className="flex-1 space-y-6 flex flex-col min-h-0">
                    {/* Categories with Search */}
                    <div className="space-y-4 shrink-0 px-2 sm:px-0">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                                Kategori
                            </h2>
                            <div className="relative w-48 sm:w-64 cursor-pointer">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari menu..."
                                    className="w-full h-9 pl-9 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-row overflow-x-auto gap-4 sm:gap-6 pb-2 no-scrollbar scroll-smooth px-1">
                            {/* All Menu Category */}
                            <button
                                className="group flex flex-col items-center gap-2.5 outline-none shrink-0 cursor-pointer"
                                onClick={() => setActiveCategory("all")}
                            >
                                <div className={cn(
                                    "relative flex items-center justify-center rounded-2xl transition-all duration-300 border-2 w-12 h-12 sm:w-14 sm:h-14",
                                    activeCategory === "all"
                                        ? "bg-transparent border-[#ff3535]"
                                        : "bg-[#fff8f8] dark:bg-zinc-900 border-transparent text-zinc-400 hover:border-zinc-100 dark:hover:border-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}>
                                    <div className={cn(
                                        "relative transition-all duration-300 flex items-center justify-center",
                                        activeCategory === "all"
                                            ? "w-8 h-8 sm:w-10 sm:h-10"
                                            : "w-7 h-7 sm:w-8 sm:h-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60"
                                    )}>
                                        <Image
                                            src="/all.png"
                                            alt="Semua Menu"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-tighter transition-colors",
                                    activeCategory === "all" ? "text-[#ff3535]" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                                )}>
                                    Semua Menu
                                </span>
                            </button>

                            {categories.map((cat) => {
                                const isActive = activeCategory === cat.id;
                                // Local fallback icons for common category names if no image
                                const getFallbackIcon = (name: string) => {
                                    if (name.toLowerCase().includes('drink') || name.toLowerCase().includes('beverage')) return CupSoda;
                                    if (name.toLowerCase().includes('coffee')) return Coffee;
                                    if (name.toLowerCase().includes('pizza')) return Pizza;
                                    if (name.toLowerCase().includes('burger')) return Beef;
                                    if (name.toLowerCase().includes('dessert')) return IceCream;
                                    return Utensils;
                                };
                                const IconComponent = getFallbackIcon(cat.name);

                                return (
                                    <button
                                        key={cat.id}
                                        className="group flex flex-col items-center gap-2.5 outline-none shrink-0 cursor-pointer"
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        <div className={cn(
                                            "relative flex items-center justify-center rounded-2xl transition-all duration-300 border-2 w-12 h-12 sm:w-14 sm:h-14",
                                            isActive
                                                ? "bg-transparent border-[#ff3535]"
                                                : "bg-[#fff8f8] dark:bg-zinc-900 border-transparent text-zinc-400 hover:border-zinc-100 dark:hover:border-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                                        )}>
                                            {cat.image ? (
                                                <div className={cn(
                                                    "relative transition-all duration-300 flex items-center justify-center",
                                                    isActive
                                                        ? "w-8 h-8 sm:w-9 sm:h-9"
                                                        : "w-7 h-7 sm:w-8 sm:h-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60"
                                                )}>
                                                    <Image
                                                        src={cat.image.startsWith('/') ? cat.image : `/images/categories/${cat.image}`}
                                                        alt={cat.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "transition-all duration-300",
                                                    isActive ? "text-[#ff3535]" : "opacity-30"
                                                )}>
                                                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-tighter transition-colors",
                                            isActive ? "text-[#ff3535]" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                                        )}>
                                            {cat.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-6 text-zinc-900">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-1">
                            {filteredProducts.map((product) => {
                                const qty = getItemQuantity(product.id);
                                const firstVariant = product.product_variants[0];
                                const hasMultipleVariants = product.product_variants.length > 1;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-3 cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="aspect-4/3 w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0">
                                            {firstVariant?.product_variant_images[0]?.image ? (
                                                <Image
                                                    src={getVariantImageUrl(firstVariant.product_variant_images[0].image)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <Utensils className="h-10 w-10 text-zinc-100 dark:text-zinc-700 opacity-50" />
                                            )}
                                            {hasMultipleVariants && (
                                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg">
                                                    {product.product_variants.length} Varian
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 px-0.5">
                                            <p className="text-[9px] font-bold text-[#ff3535] uppercase tracking-widest opacity-80">
                                                {product.product_category_trx[0]?.product_category.name || "Menu"}
                                            </p>
                                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug h-[2.8rem]">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none mb-1">Mulai dari</span>
                                                    <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
                                                        Rp {firstVariant?.price.toLocaleString('id-ID')}
                                                    </span>
                                                </div>

                                                <div className={cn(
                                                    "h-9 w-9 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl group-hover:bg-[#ff3535] group-hover:text-white transition-all shadow-md active:scale-90",
                                                    qty > 0 && "bg-[#ff3535] scale-110"
                                                )}>
                                                    {qty > 0 ? (
                                                        <span className="text-sm font-black">{qty}</span>
                                                    ) : (
                                                        <Plus className="h-5 w-5" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING CART BUTTON */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                    <Button
                        className={cn(
                            "fixed bottom-8 right-8 h-14 px-6 rounded-2xl bg-[#ff3535] hover:bg-[#e62e2e] text-white shadow-xl flex items-center gap-3 transition-transform active:scale-95 z-50",
                            cart.length === 0 && "translate-y-24 opacity-0 pointer-events-none"
                        )}
                    >
                        <div className="relative">
                            <ShoppingBag className="h-5 w-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 h-4 w-4 bg-white text-[#ff3535] text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <span className="font-black uppercase tracking-widest text-[11px]">Cek Pesanan</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-full sm:max-w-md border-l-0">
                    <OrderSidebar
                        cart={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                        onConfirm={handleConfirm}
                    />
                </SheetContent>
            </Sheet>

            {/* VARIANT SELECTOR MODAL */}
            <VariantSelector
                isOpen={isVariantModalOpen}
                onOpenChange={setIsVariantModalOpen}
                product={selectedProductForVariant}
                cart={cart}
                onSelect={handleVariantAdd}
            />
        </div>
    );
}
