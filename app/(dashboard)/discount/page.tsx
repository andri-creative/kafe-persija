"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, RefreshCw, Tag, X, AlertTriangle,
    PercentIcon, Hash, ShieldAlert, ArrowLeft, Loader2
} from "lucide-react";
import { ButtonsComponentsAdd } from "@/components/buttons-conponents";
import ActionsButtons from "@/components/acctions-buttons";
import { AccessControl } from "@/components/rbac/AccessControl";
import { usePermissions } from "@/hooks/use-permissions";
import LoadingScreen from "@/components/LoadingScrean";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatValue(type: string, value: number) {
    if (type === "percentage") return `${value}%`;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function ActiveBadge({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${active
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
            }`}>
            <span className={`w-1 h-1 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}
function TypeBadge({ type }: { type: string }) {
    const isPercent = type === "percentage";
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${isPercent
            ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
            : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            }`}>
            {isPercent ? <PercentIcon className="w-2 h-2" /> : <Hash className="w-2 h-2" />}
            {isPercent ? "Percentage" : "Nominal"}
        </span>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {[70, 50, 40, 45, 40, 40].map((w, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${w}%` }} />
                </td>
            ))}
        </tr>
    );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ discount, onClose, onConfirm, submitting, error }: {
    discount: Discount; onClose: () => void; onConfirm: () => void; submitting: boolean; error: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-[15px] font-semibold text-gray-800">Delete Discount</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-5 py-4 space-y-4">
                    <div className="flex flex-col items-center text-center gap-3 py-2">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-gray-800">
                                Delete <span className="text-rose-600">"{discount.name}"</span>?
                            </p>
                            <p className="text-[12px] text-gray-400 mt-1">
                                This discount will be permanently removed and cannot be undone.
                            </p>
                        </div>
                    </div>
                    {error && (
                        <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg text-center">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer">
                            Cancel
                        </button>
                        <button type="button" onClick={onConfirm} disabled={submitting}
                            className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-colors cursor-pointer">
                            {submitting ? "Deleting…" : "Yes, Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscountPage() {
    const { canAny, loading: permissionsLoading } = usePermissions();
    const router = useRouter();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");

    // Delete modal
    const [deleteDiscount, setDeleteDiscount] = useState<Discount | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchDiscounts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(typeFilter && { type: typeFilter }),
                ...(activeFilter !== "" && { is_active: activeFilter }),
            });
            const res = await fetch(`/api/discount?${params}`);
            if (!res.ok) throw new Error();
            setDiscounts(await res.json());
        } catch {
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, typeFilter, activeFilter]);

    useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

    // ── Delete ──
    async function handleDelete() {
        if (!deleteDiscount) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/discount/${deleteDiscount.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setDeleteDiscount(null);
            fetchDiscounts();
        } catch {
            setDeleteError("Failed to delete discount.");
        } finally {
            setDeleting(false);
        }
    }

    // ── Quick toggle active ──
    async function toggleActive(d: Discount) {
        try {
            await fetch(`/api/discount/${d.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !d.is_active }),
            });
            fetchDiscounts();
        } catch { }
    }

    if (loading || permissionsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground animate-pulse">Memuat data diskon...</p>
            </div>
        );
    }

    // RBAC: Restricted access
    if (!canAny(["discount_view", "discount_edit"])) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-200">
                    <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Access Restricted</h2>
                <p className="text-slate-500 max-w-sm mb-8 font-medium">
                    You don't have enough permission to view or manage discounts. 
                    Please contact your administrator if you believe this is an error.
                </p>
                <Link 
                    href="/dashboard" 
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const activeCount = discounts.filter((d) => d.is_active).length;
    const inactiveCount = discounts.length - activeCount;

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Tag className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 leading-none uppercase tracking-tight">Discount Management</h1>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">
                                {loading ? "Loading…" : `${activeCount} Active · ${inactiveCount} Inactive`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchDiscounts}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer">
                            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                        <AccessControl permission="discount_edit">
                          <ButtonsComponentsAdd addUrl="/discount/create" title="Discount" className="h-8 text-[10px] font-bold uppercase tracking-wider" />
                        </AccessControl>
                    </div>
                </div>

                {/* ── Stats cards ── */}
                {!loading && discounts.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total Unit", value: discounts.length, color: "text-blue-600", bg: "bg-white text-nowrap overflow-hidden" },
                            { label: "Active", value: activeCount, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                            { label: "Inactive", value: inactiveCount, color: "text-rose-400", bg: "bg-white" },
                        ].map((s) => (
                            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100/80 px-4 py-3 shadow-xs`}>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{s.label}</p>
                                <p className={`text-xl font-black mt-0.5 tracking-tight ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Search Discount Name…" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 placeholder:text-gray-400 transition-all italic" />
                    </div>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-1.5 text-[11px] font-bold bg-white border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 text-gray-600 cursor-pointer transition-all uppercase tracking-tight">
                        <option value="">All Types</option>
                        <option value="percentage">Percentage</option>
                        <option value="nominal">Nominal</option>
                    </select>
                    <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
                        className="px-3 py-1.5 text-[11px] font-bold bg-white border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 text-gray-600 cursor-pointer transition-all uppercase tracking-tight">
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-gray-50">
                                    {["Name", "Type", "Value", "Status", "Created", "Action"].map((col) => (
                                        <th key={col} className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-300">
                                                <Tag className="w-8 h-8" />
                                                <span className="text-sm font-medium">No discounts found</span>
                                                {(debouncedSearch || typeFilter || activeFilter) && (
                                                    <button onClick={() => { setSearch(""); setTypeFilter(""); setActiveFilter(""); }}
                                                        className="text-blue-500 text-xs mt-1 hover:underline cursor-pointer">
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    discounts.map((d) => (
                                        <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-black text-gray-800 text-xs uppercase tracking-tight leading-none">{d.name}</p>
                                                    {d.description && (
                                                        <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1 italic">{d.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><TypeBadge type={d.type} /></td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-black text-blue-600 tabular-nums">
                                                    {formatValue(d.type, d.value)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <AccessControl permission="discount_edit" fallback={<ActiveBadge active={d.is_active} />}>
                                                  <button onClick={() => toggleActive(d)} title="Click to toggle status" className="cursor-pointer hover:scale-105 transition-transform active:scale-95">
                                                      <ActiveBadge active={d.is_active} />
                                                  </button>
                                                </AccessControl>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{formatDate(d.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <AccessControl permission="discount_edit" fallback={<ActionsButtons viewUrl={`/discount/${d.id}/view`} showEdit={false} showDelete={false} />}>
                                                  <ActionsButtons
                                                      viewUrl={`/discount/${d.id}/view`}
                                                      onEdit={() => router.push(`/discount/${d.id}/edit`)}
                                                      onDelete={() => { setDeleteDiscount(d); setDeleteError(""); }}
                                                      deleteName={d.name}
                                                  />
                                                </AccessControl>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Delete Modal (tetap dialog) ── */}
            {deleteDiscount && (
                <DeleteModal
                    discount={deleteDiscount}
                    onClose={() => setDeleteDiscount(null)}
                    onConfirm={handleDelete}
                    submitting={deleting}
                    error={deleteError}
                />
            )}
        </div>
    );
}
