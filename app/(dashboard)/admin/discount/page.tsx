"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, RefreshCw, Tag, Plus, Pencil, Trash2, X, AlertTriangle,
    PercentIcon, Hash,
} from "lucide-react";

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
    return `Rp ${value.toLocaleString("id-ID")}`;
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function ActiveBadge({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${active
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
            {active ? "Aktif" : "Nonaktif"}
        </span>
    );
}
function TypeBadge({ type }: { type: string }) {
    const isPercent = type === "percentage";
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isPercent
                ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            }`}>
            {isPercent ? <PercentIcon className="w-2.5 h-2.5" /> : <Hash className="w-2.5 h-2.5" />}
            {isPercent ? "Persentase" : "Nominal"}
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
                    <h2 className="text-[15px] font-semibold text-gray-800">Hapus Diskon</h2>
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
                                Hapus <span className="text-rose-600">"{discount.name}"</span>?
                            </p>
                            <p className="text-[12px] text-gray-400 mt-1">
                                Diskon ini akan dihapus permanen dan tidak bisa dikembalikan.
                            </p>
                        </div>
                    </div>
                    {error && (
                        <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg text-center">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                            Batal
                        </button>
                        <button type="button" onClick={onConfirm} disabled={submitting}
                            className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-colors">
                            {submitting ? "Menghapus…" : "Ya, Hapus"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscountPage() {
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
            setDeleteError("Gagal menghapus diskon.");
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

    const active = discounts.filter((d) => d.is_active).length;
    const inactive = discounts.length - active;

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                            <Tag className="w-4 h-4 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 leading-none">Diskon</h1>
                            <p className="text-[12px] text-gray-400 mt-0.5">
                                {loading ? "Memuat…" : `${discounts.length} diskon · ${active} aktif · ${inactive} nonaktif`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button onClick={fetchDiscounts}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                        {/* ── Navigate to create page ── */}
                        <Link href="/admin/discount/create"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Diskon
                        </Link>
                    </div>
                </div>

                {/* ── Stats cards ── */}
                {!loading && discounts.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total", value: discounts.length, color: "text-gray-700", bg: "bg-white" },
                            { label: "Aktif", value: active, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Nonaktif", value: inactive, color: "text-gray-400", bg: "bg-white" },
                        ].map((s) => (
                            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 px-4 py-3`}>
                                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                                <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Cari diskon…" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400 transition-all" />
                    </div>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-600 cursor-pointer transition-all">
                        <option value="">Semua Tipe</option>
                        <option value="percentage">Persentase</option>
                        <option value="nominal">Nominal</option>
                    </select>
                    <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-600 cursor-pointer transition-all">
                        <option value="">Semua Status</option>
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                    </select>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Nama", "Tipe", "Nilai", "Status", "Dibuat", "Aksi"].map((col) => (
                                        <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
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
                                                <span className="text-sm font-medium">Tidak ada diskon</span>
                                                {(debouncedSearch || typeFilter || activeFilter) && (
                                                    <button onClick={() => { setSearch(""); setTypeFilter(""); setActiveFilter(""); }}
                                                        className="text-blue-500 text-xs mt-1 hover:underline">
                                                        Hapus filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    discounts.map((d) => (
                                        <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800 text-[13px] leading-none">{d.name}</p>
                                                    {d.description && (
                                                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{d.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><TypeBadge type={d.type} /></td>
                                            <td className="px-4 py-3">
                                                <span className="text-[13px] font-semibold text-gray-700 tabular-nums">
                                                    {formatValue(d.type, d.value)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => toggleActive(d)} title="Klik untuk toggle status">
                                                    <ActiveBadge active={d.is_active} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] text-gray-400">{formatDate(d.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {/* ── Navigate to edit page ── */}
                                                    <Link href={`/admin/discount/${d.id}/edit`}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        title="Edit">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button onClick={() => { setDeleteDiscount(d); setDeleteError(""); }} title="Hapus"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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
