"use client";

import { useEffect, useState, use } from "react";
import EditCategory from "../../../_components/edit-category";
import { AlertCircle } from "lucide-react";
import LoadingScreen from "@/components/LoadingScrean";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [minLoading, setMinLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await fetch(`/api/categories/${id}`);
                if (!res.ok) throw new Error("Kategori tidak ditemukan");
                const data = await res.json();
                setCategory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            setMinLoading(false);
        }, 1000);

        fetchCategory();
        return () => clearTimeout(timer);
    }, [id]);

    if (loading || minLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 animate-in fade-in duration-500">
                <LoadingScreen width={160} height={160} />
                <div className="space-y-1 text-center font-black">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black animate-pulse bg-linear-to-r from-indigo-400 via-blue-600 to-indigo-400 bg-clip-text text-transparent italic">
                        Menyiapkan data Kategori...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="p-6 max-w-2xl mx-auto mt-10 animate-in zoom-in-95 duration-300">
                <Card className="border-amber-100 bg-amber-50/50 shadow-sm overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="bg-amber-100 p-4 rounded-full mb-4 shadow-inner">
                            <AlertCircle className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-black text-amber-900 mb-2 uppercase tracking-tight">Kategori Tidak Tersedia</h3>
                        <p className="text-amber-700 text-xs mb-8 text-center max-w-sm font-medium leading-relaxed italic">
                            {error || "Kategori yang ingin Anda ubah tidak ditemukan atau telah dihapus."}
                        </p>
                        <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-8 rounded-xl transition-all shadow-md">
                            <Link href="/product/category">Kembali ke Daftar Kategori</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <EditCategory category={category} />;
}