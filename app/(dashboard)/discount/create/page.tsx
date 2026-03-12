"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, PercentIcon, Hash, Loader2, Info, Layers, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import { Separator } from "@/components/ui/separator";

const ic = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                {hint && <span className="text-[9px] font-bold text-slate-300 italic">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

export default function DiscountCreatePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "percentage",
        value: "",
        is_active: true,
    });

    function validate() {
        if (!form.name.trim()) return "Nama diskon wajib diisi.";
        if (!form.type) return "Tipe wajib dipilih.";
        const v = Number(form.value);
        if (isNaN(v) || v <= 0) return "Nilai harus lebih dari 0.";
        if (form.type === "percentage" && v > 100) return "Persentase maksimal 100%.";
        return "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/discount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, value: Number(form.value) }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Gagal menyimpan");
            }
            router.push("/discount");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2">
                        <ButtonsComponentsBack backUrl="/discount" title="Diskon" showText />
                        <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Tambah Diskon</h1>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                Buat diskon baru untuk kategori/produk
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-50">

                        {/* Section: Info */}
                        <div className="px-5 py-5 space-y-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Informasi Diskon</p>

                            <Field label="Nama Diskon" hint="*">
                                <input className={ic} placeholder="Contoh: Diskon Member 10%"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </Field>

                            <Field label="Deskripsi" hint="(opsional)">
                                <textarea className={ic + " resize-none"} rows={3}
                                    placeholder="Keterangan tambahan tentang diskon ini"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </Field>
                        </div>

                        {/* Section: Tipe & Nilai */}
                        <div className="px-6 py-6 space-y-5 bg-slate-50/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Tipe & Nilai</p>
                            </div>

                            {/* Type selector */}
                            <Field label="Tipe Diskon" hint="*Wajib">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { val: "percentage", label: "Persen (%)", icon: <PercentIcon className="w-3 h-3" /> },
                                        { val: "nominal", label: "Nominal (Rp)", icon: <Hash className="w-3 h-3" /> },
                                    ].map((opt) => (
                                        <button key={opt.val} type="button"
                                            onClick={() => setForm({ ...form, type: opt.val })}
                                            className={`flex items-center justify-center gap-2 h-10 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.type === opt.val
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]"
                                                : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                                                }`}>
                                            {opt.icon}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field
                                label="Besaran Nilai"
                                hint={form.type === "percentage" ? "Maks. 100" : "Rupiah"}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                                        {form.type === "percentage" ? "PCT" : "IDR"}
                                    </span>
                                    <input className={ic + " pl-12 text-xs font-black text-indigo-600"} type="number"
                                        min="0" max={form.type === "percentage" ? 100 : undefined}
                                        step={form.type === "percentage" ? 1 : 100}
                                        placeholder={form.type === "percentage" ? "10" : "10000"}
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })} />
                                </div>
                            </Field>
                        </div>

                        {/* Section: Status */}
                        <div className="px-6 py-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Status Diskon</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: true, label: "PUBLISH", desc: "Aktif Seketika", icon: <CheckCircle2 className="w-3 h-3" /> },
                                    { val: false, label: "DRAFT", desc: "Simpan Saja", icon: <XCircle className="w-3 h-3" /> },
                                ].map((opt) => (
                                    <button key={String(opt.val)} type="button"
                                        onClick={() => setForm({ ...form, is_active: opt.val })}
                                        className={`text-left px-4 py-4 rounded-xl border transition-all ${form.is_active === opt.val
                                            ? opt.val
                                                ? "bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100"
                                                : "bg-slate-100 border-slate-400"
                                            : "bg-white border-slate-100 hover:bg-slate-50"
                                            }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {opt.icon}
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${form.is_active === opt.val
                                                ? opt.val ? "text-emerald-700" : "text-slate-700"
                                                : "text-slate-400"
                                                }`}>{opt.label}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error & Actions */}
                        <div className="px-6 py-6 bg-slate-50/50 rounded-b-2xl border-t border-slate-100">
                            {error && (
                                <p className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-4 py-2 rounded-lg mb-4 text-center">
                                    ERROR: {error}
                                </p>
                            )}
                            <div className="flex items-center justify-end gap-3">
                                <Link href="/discount"
                                    className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                    Batal
                                </Link>
                                <ButtonsComponentsSave
                                    title="Diskon"
                                    isLoading={submitting}
                                    className="h-9 px-8 text-[10px] font-black uppercase tracking-widest"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
