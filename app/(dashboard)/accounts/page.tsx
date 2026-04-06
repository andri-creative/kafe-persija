"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search, RefreshCw, Users, ChevronLeft, ChevronRight, MoreHorizontal,
    ShieldCheck, User as UserIcon, Crown, CircleDot, Plus, Pencil,
    Trash2, KeyRound, X, Eye, EyeOff, AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Role { id: number; name: string; }
interface UserRoleTrx { id: number; role: Role; }
interface User {
    id: number; nickname: string; email: string; picture: string | null;
    type: string; status: string; point: number; created_at: string;
    user_role_trx: UserRoleTrx[];
}
interface ApiResponse { users: User[]; total: number; page: number; limit: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function getAvatarColor(name: string) {
    const colors = [
        "bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700",
        "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
        "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700",
        "bg-fuchsia-100 text-fuchsia-700", "bg-teal-100 text-teal-700",
    ];
    return colors[name.charCodeAt(0) % colors.length];
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const isActive = status === "ACTIVE" || status === "active" || status === "aktif";
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
            }`}>
            <CircleDot className="w-2.5 h-2.5" />
            {isActive ? "Aktif" : "Nonaktif"}
        </span>
    );
}
function TypeBadge({ type }: { type: string }) {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
        admin: { label: "Admin", cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-200", icon: <ShieldCheck className="w-3 h-3" /> },
        staff: { label: "Staff", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", icon: <UserIcon className="w-3 h-3" /> },
    };
    const style = map[type.toLowerCase()] ?? { label: type, cls: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", icon: <UserIcon className="w-3 h-3" /> };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.cls}`}>
            {style.icon}{style.label}
        </span>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {[80, 60, 50, 40, 55, 50, 40].map((w, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${w}%` }} />
                </td>
            ))}
        </tr>
    );
}

// ─── Password Input ───────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, id }: {
    value: string; onChange: (v: string) => void; placeholder?: string; id?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? "Password"}
                className="w-full px-3 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
            />
            <button type="button" onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = "md" }: {
    title: string; onClose: () => void; children: React.ReactNode; size?: "sm" | "md";
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${size === "sm" ? "max-w-sm" : "max-w-md"} animate-in fade-in zoom-in-95 duration-150`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-[15px] font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
            </div>
        </div>
    );
}

// ─── Form field ───────────────────────────────────────────────────────────────
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-[12px] font-medium text-gray-600">{label}</label>
            {children}
            {error && <p className="text-[11px] text-rose-500">{error}</p>}
        </div>
    );
}

function inputClass() {
    return "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all";
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountsPage() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modal states
    const [addOpen, setAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // Submitting
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Add form
    const [addForm, setAddForm] = useState({ nickname: "", email: "", password: "", status: "ACTIVE", role_id: "" });
    const [addType, setAddType] = useState("staff");
    // Edit form
    const [editForm, setEditForm] = useState({ nickname: "", email: "", type: "", status: "", role_id: "" });
    // Reset form
    const [newPassword, setNewPassword] = useState("");

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter, statusFilter]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page), limit: String(limit),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(typeFilter && { type: typeFilter }),
                ...(statusFilter && { status: statusFilter }),
            });
            const res = await fetch(`/api/users?${params}`);
            if (!res.ok) throw new Error();
            setData(await res.json());
        } catch { setData(null); }
        finally { setLoading(false); }
    }, [page, debouncedSearch, typeFilter, statusFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        fetch("/api/roles").then(r => r.json()).then(d => setRoles(Array.isArray(d) ? d : (d.roles ?? []))).catch(() => { });
    }, []);

    // ── Open edit modal ──
    function openEdit(user: User) {
        setEditUser(user);
        setEditForm({
            nickname: user.nickname,
            email: user.email,
            type: user.type,
            status: user.status,
            role_id: String(user.user_role_trx[0]?.role.id ?? ""),
        });
        setFormError("");
    }

    // ── Add user ──
    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!addForm.nickname || !addForm.email || !addForm.password || !addType) {
            setFormError("Semua field wajib diisi."); return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...addForm, type: addType, role_id: addForm.role_id ? Number(addForm.role_id) : undefined }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setAddOpen(false);
            setAddForm({ nickname: "", email: "", password: "", status: "ACTIVE", role_id: "" });
            setAddType("staff");
            fetchUsers();
        } catch (err: any) { setFormError(err.message || "Gagal membuat akun."); }
        finally { setSubmitting(false); }
    }

    // ── Edit user ──
    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editUser) return;
        setFormError("");
        setSubmitting(true);
        try {
            const body: any = { ...editForm };
            if (editForm.role_id) body.role_id = Number(editForm.role_id);
            else body.role_id = 0; // pass 0 to clear roles
            const res = await fetch(`/api/users/${editUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setEditUser(null);
            fetchUsers();
        } catch (err: any) { setFormError(err.message || "Gagal menyimpan perubahan."); }
        finally { setSubmitting(false); }
    }

    // ── Reset password ──
    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!resetUser) return;
        setFormError("");
        if (newPassword.length < 6) { setFormError("Password minimal 6 karakter."); return; }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/users/${resetUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setResetUser(null);
            setNewPassword("");
        } catch (err: any) { setFormError(err.message || "Gagal reset password."); }
        finally { setSubmitting(false); }
    }

    // ── Delete user ──
    async function handleDelete() {
        if (!deleteUser) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setDeleteUser(null);
            fetchUsers();
        } catch { setFormError("Gagal menghapus akun."); }
        finally { setSubmitting(false); }
    }

    const totalPages = data ? Math.ceil(data.total / limit) : 0;

    return (
        <div className="min-h-screen bg-gray-50/60">
            <div className="p-4 sm:p-6 w-full mx-auto space-y-4 sm:space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Users className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight uppercase">Manajemen Akun</h1>
                            <p className="text-[11px] text-gray-400 mt-1 font-medium italic">
                                {data ? `${data.total} pengguna terdaftar` : "Memuat data…"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button onClick={fetchUsers}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            REFRESH
                        </button>
                        <button onClick={() => { setAddOpen(true); setFormError(""); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 uppercase tracking-wider">
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Akun
                        </button>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Cari nama atau email pengguna…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400 transition-all font-medium" />
                    </div>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-600 transition-all cursor-pointer font-medium min-w-[140px]">
                        <option value="">Semua Tipe</option>
                        <option value="admin">Administrator</option>
                        <option value="staff">Staff Kafe</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 text-gray-600 transition-all cursor-pointer font-medium min-w-[140px]">
                        <option value="">Semua Status</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Nonaktif</option>
                    </select>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Pengguna", "Tipe", "Role", "Poin", "Status", "Bergabung", "Aksi"].map((col) => (
                                        <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : !data || data.users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-300">
                                                <Users className="w-8 h-8" />
                                                <span className="text-sm font-medium">Tidak ada data</span>
                                                {(debouncedSearch || typeFilter || statusFilter) && (
                                                    <button onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}
                                                        className="text-blue-500 font-bold text-xs mt-1 hover:underline uppercase tracking-tighter">
                                                        Hapus Filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                                            {/* Avatar + Name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {user.picture ? (
                                                        <img src={user.picture} alt={user.nickname}
                                                            className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarColor(user.nickname)}`}>
                                                            {getInitials(user.nickname)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-800 text-[13px] leading-none truncate">{user.nickname}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><TypeBadge type={user.type} /></td>
                                            <td className="px-4 py-3">
                                                {user.user_role_trx.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.user_role_trx.map((urt) => (
                                                            <span key={urt.id} className="px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-600 font-medium">
                                                                {urt.role.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-[11px] text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-[13px] font-medium text-gray-700 tabular-nums">
                                                    {user.point.toLocaleString("id-ID")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] text-gray-400">{formatDate(user.created_at)}</span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => { openEdit(user); }}
                                                        title="Edit"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => { setResetUser(user); setNewPassword(""); setFormError(""); }}
                                                        title="Reset Password"
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                                                        <KeyRound className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => { setDeleteUser(user); setFormError(""); }}
                                                        title="Hapus"
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

                    {/* ── Pagination ── */}
                    {data && data.total > limit && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
                            <p className="text-[12px] text-gray-400">
                                Menampilkan{" "}
                                <span className="font-medium text-gray-600">{(page - 1) * limit + 1}–{Math.min(page * limit, data.total)}</span>
                                {" "}dari <span className="font-medium text-gray-600">{data.total}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                                        acc.push(p); return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "…" ? (
                                            <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-gray-400">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </span>
                                        ) : (
                                            <button key={p} onClick={() => setPage(p as number)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-black transition-all active:scale-90 ${page === p ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-gray-500 hover:bg-gray-100"}`}>
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════
          MODAL: Tambah Akun
      ════════════════════════════════════════════════ */}
            {addOpen && (
                <Modal title="Tambah Akun Baru" onClose={() => setAddOpen(false)}>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nama *">
                                <input className={inputClass()} placeholder="Nama pengguna" value={addForm.nickname}
                                    onChange={(e) => setAddForm({ ...addForm, nickname: e.target.value })} />
                            </Field>
                            <Field label="Email *">
                                <input className={inputClass()} type="email" placeholder="email@example.com" value={addForm.email}
                                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
                            </Field>
                        </div>
                        <Field label="Password *">
                            <PasswordInput value={addForm.password} onChange={(v) => setAddForm({ ...addForm, password: v })} placeholder="Min. 6 karakter" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tipe *">
                                <select className={inputClass()} value={addType}
                                    onChange={(e) => setAddType(e.target.value)}>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select className={inputClass()} value={addForm.status}
                                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="INACTIVE">Nonaktif</option>
                                </select>
                            </Field>
                        </div>
                        {roles.length > 0 && (
                            <Field label="Role">
                                <select className={inputClass()} value={addForm.role_id}
                                    onChange={(e) => setAddForm({ ...addForm, role_id: e.target.value })}>
                                    <option value="">— Tanpa role —</option>
                                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </Field>
                        )}
                        {formError && (
                            <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{formError}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setAddOpen(false)}
                                className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                Batal
                            </button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-600/20 active:scale-95">
                                {submitting ? "Menyimpan…" : "Buat Akun"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ════════════════════════════════════════════════
          MODAL: Edit Akun
      ════════════════════════════════════════════════ */}
            {editUser && (
                <Modal title="Edit Akun" onClose={() => setEditUser(null)}>
                    <form onSubmit={handleEdit} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getAvatarColor(editUser.nickname)}`}>
                                {getInitials(editUser.nickname)}
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-gray-700">{editUser.nickname}</p>
                                <p className="text-[11px] text-gray-400">{editUser.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nama">
                                <input className={inputClass()} value={editForm.nickname}
                                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} />
                            </Field>
                            <Field label="Email">
                                <input className={inputClass()} type="email" value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tipe">
                                <select className={inputClass()} value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select className={inputClass()} value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                    <option value="ACTIVE">Aktif</option>
                                    <option value="INACTIVE">Nonaktif</option>
                                </select>
                            </Field>
                        </div>
                        {roles.length > 0 && (
                            <Field label="Role">
                                <select className={inputClass()} value={editForm.role_id}
                                    onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}>
                                    <option value="">— Tanpa role —</option>
                                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </Field>
                        )}
                        {formError && (
                            <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{formError}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setEditUser(null)}
                                className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                Batal
                            </button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-600/20 active:scale-95">
                                {submitting ? "Menyimpan…" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ════════════════════════════════════════════════
          MODAL: Reset Password
      ════════════════════════════════════════════════ */}
            {resetUser && (
                <Modal title="Reset Password" onClose={() => setResetUser(null)} size="sm">
                    <form onSubmit={handleResetPassword} className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl mb-1">
                            <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-[13px] font-medium text-gray-700">{resetUser.nickname}</p>
                                <p className="text-[11px] text-gray-400">{resetUser.email}</p>
                            </div>
                        </div>
                        <Field label="Password Baru *">
                            <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="Min. 6 karakter" />
                        </Field>
                        {formError && (
                            <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{formError}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setResetUser(null)}
                                className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                Batal
                            </button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors">
                                {submitting ? "Menyimpan…" : "Reset"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ════════════════════════════════════════════════
          MODAL: Hapus Akun
      ════════════════════════════════════════════════ */}
            {deleteUser && (
                <Modal title="Hapus Akun" onClose={() => setDeleteUser(null)} size="sm">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center text-center gap-3 py-2">
                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-gray-800">Hapus <span className="text-rose-600">{deleteUser.nickname}</span>?</p>
                                <p className="text-[12px] text-gray-400 mt-1">
                                    Aksi ini tidak dapat dibatalkan. Semua data akun akan dihapus permanen.
                                </p>
                            </div>
                        </div>
                        {formError && (
                            <p className="text-[12px] text-rose-500 bg-rose-50 px-3 py-2 rounded-lg text-center">{formError}</p>
                        )}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setDeleteUser(null)}
                                className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                Batal
                            </button>
                            <button type="button" onClick={handleDelete} disabled={submitting}
                                className="flex-1 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-colors">
                                {submitting ? "Menghapus…" : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
