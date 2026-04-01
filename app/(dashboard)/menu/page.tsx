"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// Sub-components
import { CategoryList } from "./components/CategoryList";
import { ProductGrid } from "./components/ProductGrid";
import { OrderSummary } from "./components/OrderSummary";
import { ProductVariantDialog } from "./components/ProductVariantDialog";

// Types
import { Category, Product, ProductVariant, CartItem } from "./types";

export default function MenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
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
        fetchCategories();
        fetchDiscounts();
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currentDiscount = discounts.find(d => d.id === selectedDiscountId);
    let discountAmount = 0;
    if (currentDiscount?.type === 'fixed') discountAmount = currentDiscount.value;
    else if (currentDiscount?.type === 'percent') discountAmount = (cartTotal * currentDiscount.value) / 100;

    const finalTotal = Math.max(0, cartTotal - discountAmount);

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

    const fetchDiscounts = async () => {
        try {
            const response = await fetch('/api/discount?is_active=true');
            if (response.ok) {
                const data = await response.json();
                const mappedData = data.map((d: any) => ({
                    id: d.id.toString(),
                    label: d.name.toUpperCase(),
                    value: d.value,
                    type: d.type.toLowerCase() === 'percentage' ? 'percent' : 'fixed'
                }));
                setDiscounts([{ id: 'none', label: 'TIDAK ADA', value: 0, type: 'fixed' }, ...mappedData]);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
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
        const firstActiveVariant = product.product_variants.find(v => !v.status);
        setSelectedVariant(firstActiveVariant || null);
        setIsDialogOpen(true);
    };

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-full">
                {/* Left Section: Menu & Categories */}
                <div className="lg:col-span-3 flex flex-col gap-2 h-full overflow-hidden">
                    <CategoryList 
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />

                    <ProductGrid 
                        products={products}
                        onProductClick={handleProductClick}
                    />
                </div>

                {/* Right Section: Order Summary */}
                <OrderSummary 
                    transactionId={transactionId}
                    customerName={customerName}
                    onCustomerNameChange={setCustomerName}
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeItem}
                    cartTotal={cartTotal}
                    finalTotal={finalTotal}
                    discounts={discounts}
                    selectedDiscountId={selectedDiscountId}
                    onDiscountChange={setSelectedDiscountId}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    cashReceived={cashReceived}
                    onCashReceivedChange={setCashReceived}
                    isSubmitting={isSubmitting}
                    onPayment={handlePayment}
                />
            </div>

            <Toaster position="top-right" />

            <ProductVariantDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                product={selectedProduct}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
                onAddToCart={addToCart}
                cart={cart}
            />
        </div>
    );
}
