"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, PercentIcon, Hash, Loader2, Info, Layers, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import { Separator } from "@/components/ui/separator";
import { usePermissions } from "@/hooks/use-permissions";
import { LogoLoading } from "@/components/logo-loading";

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

export default function DiscountEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { can, loading: permissionsLoading } = usePermissions();
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
                .catch(() => setError("Failed to load discount data."))
                .finally(() => setLoading(false));
        });
    }, [params]);

    function validate() {
        if (!form.name.trim()) return "Discount name is required.";
        const v = Number(form.value);
        if (isNaN(v) || v <= 0) return "Value must be greater than 0.";
        if (form.type === "percentage" && v > 100) return "Percentage cannot exceed 100%.";
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
                throw new Error(d.error || "Failed to save discount");
            }
            router.push("/discount");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || permissionsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <LogoLoading width={150} height={150} />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse font-black">
                    Validating session and permissions...
                </p>
            </div>
        );
    }

    // RBAC: Restricted access
    if (!can("discount_edit")) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-200">
                    <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Access Restricted</h2>
                <p className="text-slate-500 max-w-sm mb-8 font-medium">
                    You don't have enough permission to edit discounts. 
                    Please contact your administrator if you believe this is an error.
                </p>
                <Link 
                    href="/discount" 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Discounts
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2">
                        <ButtonsComponentsBack backUrl="/discount" title="Discount" showText />
                        <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Edit Discount</h1>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                {form.name || "Updating discount..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-slate-800">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-50">

                        {/* Section: Info */}
                        <div className="px-6 py-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-3.5 h-3.5 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Basic Information</p>
                            </div>

                            <Field label="Discount Name" hint="*Required">
                                <input className={ic + " text-xs font-bold uppercase placeholder:italic"} placeholder="e.g., Member Special 10%"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </Field>

                            <Field label="Description" hint="(optional)">
                                <textarea className={ic + " resize-none text-xs leading-relaxed italic"} rows={3}
                                    placeholder="Additional details about this discount..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </Field>
                        </div>

                        {/* Section: Type & Value */}
                        <div className="px-6 py-6 space-y-5 bg-slate-50/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Type & Value</p>
                            </div>

                            <Field label="Discount Type" hint="*Required">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { val: "percentage", label: "Percent (%)", icon: <PercentIcon className="w-3 h-3" /> },
                                        { val: "nominal", label: "Nominal (Rp)", icon: <Hash className="w-3 h-3" /> },
                                    ].map((opt) => (
                                        <button key={opt.val} type="button"
                                            onClick={() => setForm({ ...form, type: opt.val })}
                                            className={`flex items-center justify-center gap-2 h-10 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${form.type === opt.val
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]"
                                                : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                                                }`}>
                                            {opt.icon}{opt.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                            <Field
                                label="Discount Amount"
                                hint={form.type === "percentage" ? "Max 100" : "In Rupiah"}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                                        {form.type === "percentage" ? "PCT" : "IDR"}
                                    </span>
                                    <input className={ic + " pl-12 text-xs font-black text-indigo-600"} type="number"
                                        min="0" max={form.type === "percentage" ? 100 : undefined}
                                        step={form.type === "percentage" ? 1 : 100}
                                        placeholder={form.type === "percentage" ? "10" : "10,000"}
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })} />
                                </div>
                            </Field>
                        </div>

                        {/* Section: Status */}
                        <div className="px-6 py-6 space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Discount Status</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: true, label: "PUBLISH", desc: "Active Immediately", icon: <CheckCircle2 className="w-3 h-3" /> },
                                    { val: false, label: "DRAFT", desc: "Save Offline", icon: <XCircle className="w-3 h-3" /> },
                                ].map((opt) => (
                                    <button key={String(opt.val)} type="button"
                                        onClick={() => setForm({ ...form, is_active: opt.val })}
                                        className={`text-left px-4 py-4 rounded-xl border transition-all cursor-pointer ${form.is_active === opt.val
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
                                    Cancel
                                </Link>
                                <ButtonsComponentsSave
                                    title="Update Discount"
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
