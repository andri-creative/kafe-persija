"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { getVariantImageUrl } from "@/lib/variant-helper";
import {
    ArrowLeft,
    Package,
    Tag,
    Layers,
    Info,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type VariantImage = {
    id: number;
    image: string;
};

type ProductVariant = {
    id: number;
    desc: string | null;
    price: number;
    stok: number | null;
    size: string | null;
    status: boolean;
    product_variant_images: VariantImage[];
};

type ProductCategoryTrx = {
    product_category: {
        name: string;
    };
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    status: string;
    product_category_trx: ProductCategoryTrx[];
    product_variants: ProductVariant[];
};

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Produk tidak ditemukan");
                    }
                    throw new Error("Gagal mengambil data produk");
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
                toast.error(err instanceof Error ? err.message : "Gagal memuat data produk");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Memuat data produk...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                        <p className="text-red-700 mb-6">{error || "Produk tidak ditemukan"}</p>
                        <Button asChild>
                            <Link href="/admin/product">Kembali ke Daftar Produk</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <ToastContainer />

            {/* Header & Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/product">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <p className="text-muted-foreground italic truncate max-w-md">
                            Detail lengkap produk dan variannya
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={
                        product.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                            : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
                    }>
                        {product.status.toUpperCase()}
                    </Badge>
                    <Button asChild variant="outline">
                        <Link href={`/admin/product/${product.id}/edit`}>Edit Produk</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info & Categories */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Informasi Umum
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Nama Produk</label>
                                <p className="text-base font-medium">{product.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Deskripsi</label>
                                <p className="text-base text-gray-700 break-words">
                                    {product.description || <span className="text-gray-400 italic">Tidak ada deskripsi</span>}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {product.product_category_trx.length > 0 ? (
                                    product.product_category_trx.map((trx, index) => (
                                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                            {trx.product_category.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Belum ada kategori</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Variants Section */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 overflow-auto">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    Varian Produk
                                </CardTitle>
                                <CardDescription>
                                    Daftar semua varian, stok, dan harga
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="ml-auto">
                                {product.product_variants.length} Varian
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Gambar</TableHead>
                                            <TableHead>Varian / Deskripsi</TableHead>
                                            <TableHead>Ukuran</TableHead>
                                            <TableHead>Stok</TableHead>
                                            <TableHead className="text-right">Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.product_variants.length > 0 ? (
                                            product.product_variants.map((variant) => (
                                                <TableRow key={variant.id}>
                                                    <TableCell>
                                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 border relative group">
                                                            {variant.product_variant_images.length > 0 ? (
                                                                <Image
                                                                    src={getVariantImageUrl(variant.product_variant_images[0].image)}
                                                                    alt={variant.desc || "Variant"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{variant.desc || "Standard"}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {variant.id}</div>
                                                    </TableCell>
                                                    <TableCell>{variant.size || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={variant.stok && variant.stok > 0 ? "outline" : "destructive"}>
                                                            {variant.stok ?? 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-blue-600">
                                                        {formatPrice(variant.price)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic">
                                                    Belum ada varian untuk produk ini
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gallery View for Mobile or Visual Reference */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {product.product_variants.flatMap(v => v.product_variant_images).map((img, idx) => (
                            <div key={img.id} className="aspect-square relative rounded-lg overflow-hidden border bg-white group shadow-sm hover:shadow-md transition-shadow">
                                <Image
                                    src={getVariantImageUrl(img.image)}
                                    alt={`Gallery ${idx}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
