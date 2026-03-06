"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LayoutGrid, Loader2, UtensilsCrossed, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2, X, Utensils, User, Printer, CreditCard, QrCode, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVariantImageUrl } from "@/lib/variant-helper";
import toast, { Toaster } from "react-hot-toast";

interface Category {
    id: number;
    name: string;
    image: string | null;
}

interface ProductVariant {
    id: number;
    price: number;
    desc: string;
    stok: number | null;
    status: boolean;
    product_variant_images: { image: string }[];
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    product_category_trx: { product_category: { id: number; name: string } }[];
    product_variants: ProductVariant[];
}

interface CartItem {
    id: string; // unique id for each item in cart (product_id + variant_id)
    productId: number;
    productName: string;
    variantId: number;
    variantDesc: string;
    price: number;
    quantity: number;
    image: string | null;
}

export default function MenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [selectedDiscountId, setSelectedDiscountId] = useState('none');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // netzme | cash
    const [cashReceived, setCashReceived] = useState<number | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const generateTransactionId = () => `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    useEffect(() => {
        setTransactionId(generateTransactionId());
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const DISCOUNTS = [
        { id: 'none', label: 'TIDAK ADA', value: 0, type: 'fixed' },
        { id: 'flash_sale', label: 'FLASH SALE 25 RIBU', value: 25000, type: 'fixed' },
        { id: 'member', label: 'PROMO MEMBER 20%', value: 20, type: 'percent' },
    ];

    const currentDiscount = DISCOUNTS.find(d => d.id === selectedDiscountId);
    let discountAmount = 0;
    if (currentDiscount?.type === 'fixed') discountAmount = currentDiscount.value;
    else if (currentDiscount?.type === 'percent') discountAmount = (cartTotal * currentDiscount.value) / 100;

    const finalTotal = Math.max(0, cartTotal - discountAmount);
    const changeAmount = typeof cashReceived === 'number' ? Math.max(0, cashReceived - finalTotal) : 0;

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async (categoryName: string) => {
        try {
            setIsProductsLoading(true);
            const url = categoryName === "all" ? '/api/products' : `/api/products?category=${encodeURIComponent(categoryName)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const categoryName = selectedCategory === "all" ? "all" : categories.find(c => c.id.toString() === selectedCategory)?.name || "all";
        fetchProducts(categoryName);
    }, [selectedCategory, categories]);

    const addToCart = (product: Product, variant: ProductVariant) => {
        const cartId = `${product.id}-${variant.id}`;
        setCart(prev => {
            const existing = prev.find(item => item.id === cartId);
            if (existing) {
                return prev.map(item =>
                    item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: cartId,
                productId: product.id,
                productName: product.name,
                variantId: variant.id,
                variantDesc: variant.desc,
                price: variant.price,
                quantity: 1,
                image: variant.product_variant_images[0]?.image || null
            }];
        });
        setIsDialogOpen(false);
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === cartId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (cartId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartId));
    };

    const handlePayment = async () => {
        if (cart.length === 0 || !customerName) {
            toast.error("Nama pelanggan dan pesanan harus diisi!");
            return;
        }

        if (paymentMethod === 'cash' && (cashReceived === "" || cashReceived < finalTotal)) {
            toast.error("Jumlah uang tunai tidak mencukupi!");
            return;
        }

        try {
            setIsSubmitting(true);

            const productsInOrder = Array.from(new Set(cart.map(item => item.productId))).map(pId => {
                const productItems = cart.filter(item => item.productId === pId);
                const originalProduct = products.find(p => p.id === pId);

                return {
                    id: Number(pId),
                    name: productItems[0].productName,
                    categories: originalProduct?.product_category_trx.map(trx => ({
                        id: Number(trx.product_category.id),
                        name: trx.product_category.name
                    })) || [],
                    variants: productItems.map(item => ({
                        id: Number(item.variantId),
                        name: item.variantDesc,
                        price: Number(item.price),
                        image: item.image || "",
                        quantity: Number(item.quantity),
                        discount: 0,
                        total_price: Number(item.price * item.quantity)
                    })),
                    discount: 0,
                    status: "ORDERED"
                };
            });

            const payload = {
                order_number: transactionId,
                user_id: Number((session as any)?.user?.id || 0),
                customer_name: customerName,
                payment_method: paymentMethod.toUpperCase(),
                total_amount: Number(finalTotal),
                amount: Number(finalTotal),
                status: "PAID",
                products: productsInOrder,
                payment: {
                    status: "PAID",
                    total_payment: Number(finalTotal),
                    sources: [{
                        name: paymentMethod.toUpperCase(),
                        amount: Number(paymentMethod === 'cash' ? cashReceived : finalTotal)
                    }],
                    updated_at: new Date().toISOString()
                }
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Pesanan berhasil dibuat!");
                setCart([]);
                setCustomerName("");
                setCashReceived("");
                setSelectedDiscountId('none');
                setPaymentMethod('cash');
                setTransactionId(generateTransactionId());
            } else {
                toast.error(result.message || "Gagal membuat pesanan");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Terjadi kesalahan sistem saat memproses pembayaran");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setSelectedVariant(product.product_variants[0] || null);
        setIsDialogOpen(true);
    };

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-full">
                {/* Left Section: Menu & Categories */}
                <div className="lg:col-span-3 flex flex-col gap-2 h-full overflow-hidden">
                    {/* Categories Section */}
                    <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Categories</span>
                            <div className="h-px flex-1 bg-slate-200/60"></div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl px-2.5 py-1.5 shrink-0 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5">
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* All Category */}
                                        <button
                                            onClick={() => setSelectedCategory("all")}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer group active:scale-95",
                                                selectedCategory === "all"
                                                    ? "bg-red-50 border-[#ff3535] text-[#ff3535] shadow-lg shadow-red-500/10"
                                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                selectedCategory === "all" ? "bg-red-100/50" : "bg-slate-100 group-hover:bg-slate-200"
                                            )}>
                                                <Image src="/all.png" alt="All" width={16} height={16} className="object-contain" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tight">Semua</span>
                                        </button>

                                        {/* Dynamic Categories */}
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id.toString())}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer group active:scale-95",
                                                    selectedCategory === cat.id.toString()
                                                        ? "bg-red-50 border-[#ff3535] text-[#ff3535] shadow-lg shadow-red-500/10"
                                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                    selectedCategory === cat.id.toString() ? "bg-red-100/50" : "bg-slate-100 group-hover:bg-slate-200"
                                                )}>
                                                    <Image
                                                        src={cat.image ? `/images/categories/${cat.image}` : "/all.png"}
                                                        alt={cat.name}
                                                        width={16}
                                                        height={16}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-tight">{cat.name}</span>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu Items Section */}
                    <div className="flex-1 flex flex-col gap-1.5 overflow-hidden pt-1">
                        <div className="flex items-center gap-2 px-1 shrink-0">
                            <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Menu Items</span>
                            <div className="h-px flex-1 bg-slate-200/60"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pr-0.5">
                            {isProductsLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 opacity-20">
                                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Memuat Menu...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 opacity-10 italic">
                                    <UtensilsCrossed className="w-6 h-6 mb-1" />
                                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">Belum ada produk...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 gap-2">
                                    {products.map((product) => {
                                        const variant = product.product_variants[0];
                                        const images = variant?.product_variant_images || [];

                                        return (
                                            <Card
                                                key={product.id}
                                                onClick={() => handleProductClick(product)}
                                                className="group p-2 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 rounded-2xl bg-white overflow-hidden cursor-pointer active:scale-95"
                                            >
                                                <div className="space-y-2.5">
                                                    {/* Image Container - Square & Clean */}
                                                    <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center group-hover:bg-red-50/30 transition-colors">
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
                                                        <h5 className="text-[11px] font-black text-slate-900 truncate leading-tight uppercase tracking-tight group-hover:text-[#ff3535] transition-colors">{product.name}</h5>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-[#ff3535] tracking-tighter">
                                                                Rp {variant?.price?.toLocaleString() || 0}
                                                            </span>
                                                            <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#ff3535] group-hover:border-[#ff3535] group-hover:rotate-90 transition-all duration-300">
                                                                <LayoutGrid className="w-2.5 h-2.5 text-slate-300 group-hover:text-white" />
                                                            </div>
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
                </div>

                {/* Right Section: Order Summary */}
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
                                    onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
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
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-[10px] font-black text-[#ff3535]">Rp {item.price.toLocaleString()}</span>
                                                </div>

                                                <div className="flex items-center gap-2 bg-slate-100/50 p-0.5 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-white hover:text-[#ff3535] shadow-sm active:scale-90 transition-all"
                                                    >
                                                        <Minus className="w-2.5 h-2.5" />
                                                    </button>
                                                    <span className="text-[10px] font-bold w-3 text-center text-slate-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
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
                            {/* Payment Summary */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-bold text-slate-900">Payment Summary</h4>
                                <div className="space-y-1.5 px-0.5">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                        <span>Sub Total</span>
                                        <span className="text-slate-900">Rp {cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                                        <span>Discount 0%</span>
                                        <span className="text-slate-900">0</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-900 uppercase">Total</span>
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
                                                onClick={() => setPaymentMethod(m.id)}
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
                                                onChange={(e) => setCashReceived(e.target.value === '' ? '' : Number(e.target.value))}
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
                                    onClick={handlePayment}
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
            </div>

            <Toaster position="top-right" />

            {/* Selection Dialog - Refined Version */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent showCloseButton={false} className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 rounded-3xl gap-0">
                    {selectedProduct && (
                        <div className="flex flex-col">
                            {/* Header Section */}
                            <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                {selectedVariant?.product_variant_images[0]?.image ? (
                                    <Image
                                        src={getVariantImageUrl(selectedVariant.product_variant_images[0].image)}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <Utensils className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-[#ff3535] text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest w-fit mb-2">
                                        Pilihan Varian
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1">
                                        {selectedProduct.name}
                                    </h2>
                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide line-clamp-1 mt-0.5">
                                        {selectedProduct.description || "Silakan pilih salah satu varian menu"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="grid gap-3">
                                        {selectedProduct.product_variants.map((variant) => {
                                            const isSelected = selectedVariant?.id === variant.id;
                                            const currentInCart = cart.find(item => item.variantId === variant.id)?.quantity || 0;
                                            const isUnlimited = variant.stok === null;
                                            const remainingStock = isUnlimited ? 99 : variant.stok! - currentInCart;
                                            const isAvailable = !variant.status && remainingStock > 0;

                                            return (
                                                <button
                                                    key={variant.id}
                                                    disabled={!isAvailable}
                                                    onClick={() => setSelectedVariant(variant)}
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
                                        onClick={() => setIsDialogOpen(false)}
                                        className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={() => selectedVariant && addToCart(selectedProduct, selectedVariant)}
                                        className="flex-2 h-12 bg-[#ff3535] hover:bg-[#e62e2e] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                    >
                                        Tambah Pesanan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
