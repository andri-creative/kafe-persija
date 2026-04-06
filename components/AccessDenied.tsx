"use client";

import React from "react";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[70vh] animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                {/* Decorative Elements */}
                <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-24 w-24 rounded-3xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-red-500/30">
                    <ShieldAlert className="h-12 w-12" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white border-4 border-zinc-50 flex items-center justify-center text-red-500 shadow-lg">
                    <Lock className="h-5 w-5" />
                </div>
            </div>

            <div className="text-center space-y-3 max-w-md">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter italic">
                    Akses <span className="text-red-600">Ditolak!</span>
                </h2>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                    Maaf bang, akun kamu tidak punya izin untuk mengakses halaman ini. Silakan hubungi Super Admin jika ini adalah kesalahan.
                </p>
            </div>

            <div className="flex items-center gap-4 mt-10">
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="h-12 px-8 rounded-2xl border-zinc-200 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 active:scale-95 transition-all"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button 
                    onClick={() => router.push("/dashboard")}
                    className="h-12 px-8 rounded-2xl bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
                >
                    <Home className="mr-2 h-4 w-4" /> Dashboard
                </Button>
            </div>

            <p className="mt-12 text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em] italic">
                Persija POS V2 • Security System
            </p>
        </div>
    );
}
