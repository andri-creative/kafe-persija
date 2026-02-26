"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, PercentIcon, Hash, Loader2 } from "lucide-react";
import Link from "next/link";

const ic = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <div>
                <label className="text-[13px] font-medium text-gray-700">{label}</label>
                {hint && <span className="ml-1.5 text-[11px] text-gray-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

export default function DiscountEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [discountId, setDiscountId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "percentage",
        value: "",
        is_active: true,
    });

    // Resolve params and fetch discount data
    useEffect(() => {
        params.then(({ id }) => {
            setDiscountId(id);
            fetch(`/api/discount/${id}`)
                .then((r) => r.json())
                .then((d) => {
                    setForm({
                        name: d.name || "",
                        description: d.description || "",
                        type: d.type || "percentage",
                        value: String(d.value ?? ""),
                        is_active: d.is_active ?? true,
                    });
                })
                .catch(() => setError("Gagal memuat data diskon."))
                .finally(() => setLoading(false));
        });
    }, [params]);

    function validate() {
        if (!form.name.trim()) return "Nama diskon wajib diisi.";
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
            const res = await fetch(`/api/discount/${discountId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, value: Number(form.value) }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Gagal menyimpan");
            }
            router.push("/admin/discount");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-sm">Memuat data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/discount"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900 leading-none">Edit Diskon</h1>
                            <p className="text-[11px] text-gray-400 mt-0.5">{form.name}</p>
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
                        <div className="px-5 py-5 space-y-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tipe & Nilai</p>
                            <Field label="Tipe Diskon" hint="*">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: "percentage", label: "Persentase (%)", icon: <PercentIcon className="w-4 h-4" /> },
                                        { val: "nominal", label: "Nominal (Rp)", icon: <Hash className="w-4 h-4" /> },
                                    ].map((opt) => (
                                        <button key={opt.val} type="button"
                                            onClick={() => setForm({ ...form, type: opt.val })}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.type === opt.val
                                                    ? "bg-blue-50 border-blue-400 text-blue-700"
                                                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                                }`}>
                                            {opt.icon}{opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                            <Field
                                label="Nilai Diskon"
                                hint={form.type === "percentage" ? "*(maks. 100%)" : "*(dalam Rupiah)"}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                        {form.type === "percentage" ? "%" : "Rp"}
                                    </span>
                                    <input className={ic + " pl-9"} type="number"
                                        min="0" max={form.type === "percentage" ? 100 : undefined}
                                        step={form.type === "percentage" ? 1 : 100}
                                        placeholder={form.type === "percentage" ? "10" : "10000"}
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })} />
                                </div>
                            </Field>
                        </div>

                        {/* Section: Status */}
                        <div className="px-5 py-5 space-y-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { val: true, label: "Aktif", desc: "Diskon langsung bisa digunakan" },
                                    { val: false, label: "Nonaktif", desc: "Diskon disimpan tapi tidak aktif" },
                                ].map((opt) => (
                                    <button key={String(opt.val)} type="button"
                                        onClick={() => setForm({ ...form, is_active: opt.val })}
                                        className={`text-left px-3 py-3 rounded-xl border transition-all ${form.is_active === opt.val
                                                ? opt.val
                                                    ? "bg-emerald-50 border-emerald-400"
                                                    : "bg-gray-100 border-gray-400"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                            }`}>
                                        <p className={`text-[13px] font-semibold ${form.is_active === opt.val
                                                ? opt.val ? "text-emerald-700" : "text-gray-600"
                                                : "text-gray-500"
                                            }`}>{opt.label}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error & Actions */}
                        <div className="px-5 py-4 space-y-3">
                            {error && (
                                <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
                            )}
                            <div className="flex gap-2">
                                <Link href="/admin/discount"
                                    className="flex-1 py-2.5 text-center text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                                    Batal
                                </Link>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {submitting ? "Menyimpan…" : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
