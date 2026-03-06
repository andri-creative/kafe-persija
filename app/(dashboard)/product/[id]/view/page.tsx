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
    AlertCircle,
    Edit2,
    Calendar,
    CheckCircle2,
    XCircle,
    ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
                            <Link href="/product">Kembali ke Daftar Produk</Link>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2">
                    <ButtonsComponentsBack backUrl="/product" title="Produk" showText />
                    <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">{product.name}</h1>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                            Informasi Detail Produk
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`text-[10px] font-black px-3 py-1 border-none shadow-sm ${product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-rose-100 text-rose-700"
                        }`}>
                        {product.status === "active" ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AKTIF</span>
                        ) : (
                            <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> NONAKTIF</span>
                        )}
                    </Badge>
                    <Link href={`/product/${product.id}/edit`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 h-8 text-xs gap-2 cursor-pointer font-bold px-4">
                            <Edit2 className="h-3 w-3" />
                            Ubah Produk
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info & Categories */}
                <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                    <Card className="border-none shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                            <CardTitle className="flex items-center gap-2 text-sm font-black text-slate-800">
                                <Info className="h-4 w-4 text-indigo-500" />
                                Informasi Umum
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID Produk</span>
                                <p className="text-xs font-black text-slate-700">#{product.id}</p>
                            </div>

                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nama Produk</span>
                                <p className="text-sm font-black text-slate-900">{product.name}</p>
                            </div>

                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deskripsi Detail</span>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    {product.description || "Tidak ada deskripsi yang tersedia untuk produk ini."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                            <CardTitle className="flex items-center gap-2 text-sm font-black text-slate-800">
                                <Tag className="h-4 w-4 text-indigo-500" />
                                Penempatan Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {product.product_category_trx.length > 0 ? (
                                    product.product_category_trx.map((trx, index) => (
                                        <Badge key={index} className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 text-[10px] px-3 py-1 font-bold">
                                            {trx.product_category.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <div className="text-center w-full py-4 border-2 border-dashed rounded-xl">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase italic">Tanpa Kategori</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Variants Section */}
                <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
                    <Card className="border-none shadow-xl bg-white h-fit">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm font-black text-slate-800">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    Varian Produk
                                </CardTitle>
                                <CardDescription className="text-[10px] font-medium uppercase tracking-wider">
                                    Total: {product.product_variants.length} Varian Terdaftar
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-none">
                                            <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-wider py-4">Visual</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-wider">Informasi Varian</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-wider">Ukuran</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-wider text-center">Stok</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-wider text-right px-6">Harga</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.product_variants.length > 0 ? (
                                            product.product_variants.map((variant) => (
                                                <TableRow key={variant.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                                    <TableCell className="py-4">
                                                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-md relative group cursor-zoom-in">
                                                            {variant.product_variant_images.length > 0 ? (
                                                                <Image
                                                                    src={getVariantImageUrl(variant.product_variant_images[0].image)}
                                                                    alt={variant.desc || "Variant"}
                                                                    fill
                                                                    className="object-cover transition-transform group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <ShoppingBag className="h-5 w-5 text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-black text-xs text-slate-800 uppercase tracking-tight">{variant.desc || "Standard"}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">VARIANT ID: #{variant.id}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[9px] font-bold border-slate-200">
                                                            {variant.size || "ALL SIZE"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className={`text-xs font-black ${variant.stok && variant.stok > 0 ? "text-green-600" : "text-rose-500"}`}>
                                                            {variant.stok ?? 0}
                                                        </div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Unit</div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="text-sm font-black text-indigo-600/90 tracking-tight">
                                                            {formatPrice(variant.price)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                                        <Package className="w-10 h-10" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Kosong</p>
                                                    </div>
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
