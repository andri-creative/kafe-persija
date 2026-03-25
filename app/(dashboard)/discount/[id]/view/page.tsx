"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Tag,
    Info,
    Calendar,
    CheckCircle2,
    XCircle,
    Edit2,
    Clock,
    PercentIcon,
    Hash,
    Layers,
    History
} from "lucide-react";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface Discount {
    id: number;
    name: string;
    description: string | null;
    type: string;
    value: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function DiscountViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDiscount() {
            try {
                const res = await fetch(`/api/discount/${id}`);
                if (!res.ok) throw new Error("Gagal mengambil data diskon");
                setDiscount(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchDiscount();
    }, [id]);

    const formatValue = (type: string, value: number) => {
        if (type === "percentage") return `${value}%`;
        return `Rp ${value.toLocaleString("id-ID")}`;
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat data...</p>
            </div>
        </div>
    );

    if (error || !discount) return (
        <div className="p-6 text-center space-y-4">
            <p className="text-rose-500 font-bold">{error || "Data tidak ditemukan"}</p>
            <Link href="/discount" className="text-blue-500 underline text-xs">Kembali ke Daftar Diskon</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Header Section ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2">
                        <ButtonsComponentsBack backUrl="/discount" title="Diskon" showText />
                        <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Detail Diskon</h1>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                {discount.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`text-[10px] font-black px-3 py-1 border-none shadow-sm ${discount.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                            }`}>
                            {discount.is_active ? (
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AKTIF</span>
                            ) : (
                                <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> NONAKTIF</span>
                            )}
                        </Badge>
                        <Link href={`/discount/${discount.id}/edit`}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 h-8 text-[10px] gap-2 cursor-pointer font-black uppercase tracking-wider px-4">
                                <Edit2 className="h-3 w-3" />
                                Ubah Data
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* ── Left Column: Main Stats ── */}
                    <div className="md:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <div className={`h-2 ${discount.type === "percentage" ? "bg-indigo-500" : "bg-blue-500"}`} />
                            <CardContent className="p-6 text-center">
                                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${discount.type === "percentage" ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
                                    }`}>
                                    {discount.type === "percentage" ? <PercentIcon className="w-7 h-7" /> : <Hash className="w-7 h-7" />}
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nilai Diskon</p>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                                    {formatValue(discount.type, discount.value)}
                                </h2>
                                <Badge variant="outline" className="mt-4 text-[9px] font-black border-slate-200 bg-slate-50 uppercase tracking-tight px-3">
                                    Tipe: {discount.type === "percentage" ? "Persentase" : "Nominal Tetap"}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-3">
                                <CardTitle className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-wider">
                                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                    Informasi Waktu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dibuat Pada</span>
                                    <p className="text-[11px] font-black text-slate-700">{formatDate(discount.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pembaruan Terakhir</span>
                                    <p className="text-[11px] font-black text-slate-700">{formatDate(discount.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Right Column: Detail Information ── */}
                    <div className="md:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
                        <Card className="border-none shadow-xl bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-4">
                                <CardTitle className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest">
                                    <Info className="h-4 w-4 text-indigo-500" />
                                    Informasi Lengkap
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">Nama Promo</span>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{discount.name}</p>
                                    </div>
                                    <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">ID Diskon</span>
                                        <p className="text-xs font-black text-indigo-600">DISC-{discount.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 px-4 py-4 bg-slate-50 rounded-xl border border-slate-100/50 min-h-[100px]">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-2">Deskripsi Promo</span>
                                    <p className="text-xs text-slate-600 leading-relaxed italic">
                                        {discount.description || "Tidak ada deskripsi tambahan untuk program diskon ini."}
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 italic">
                                    <div className="mt-0.5">
                                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <p className="text-[10px] text-blue-600 font-medium">
                                        Promo ini akan diterapkan secara otomatis pada produk atau kategori yang terhubung jika statusnya diatur menjadi <span className="font-black uppercase">Aktif</span>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── Visual Guide or Secondary Info ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="border-none shadow-lg bg-white p-4 flex items-center gap-4 group hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <History className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</p>
                                    <p className="text-[11px] font-bold text-slate-700">Ditinjau secara berkala</p>
                                </div>
                            </Card>
                            <Card className="border-none shadow-lg bg-white p-4 flex items-center gap-4 group hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kategori</p>
                                    <p className="text-[11px] font-bold text-slate-700">General Promotion</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
