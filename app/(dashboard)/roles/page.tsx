"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus,
    ShieldCheck,
    Edit2,
    Trash2,
    MoreVertical,
    Search,
    Settings2,
    Loader2,
    Key,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { clearPermissionsCache, usePermissions } from "@/hooks/use-permissions";
import { ButtonsComponentsAdd } from "@/components/buttons-conponents";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { PaginationGlobal } from "@/components/paginate-global";
import ActionsButtons from "@/components/acctions-buttons";

interface Permission {
    id: number;
    name: string;
    description?: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    role_permission_trx: { permission: Permission }[];
    user_role_trx: { id: number }[];
}

export default function RolesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const { can } = usePermissions();
    // Assign Permission Modal
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [permSearch, setPermSearch] = useState("");
    const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);

    // Create Role Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", description: "" });
    const [creating, setCreating] = useState(false);

    const fetchData = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), search });
            const [rolesRes, permsRes] = await Promise.all([
                fetch(`/api/roles?${params}`),
                fetch("/api/permissions?all=true"),  // semua permissions tanpa paginasi
            ]);
            const rolesData = await rolesRes.json();
            const permsData = await permsRes.json();
            if (rolesData.data) {
                setRoles(rolesData.data);
                setTotalPages(rolesData.totalPages);
                setTotal(rolesData.total);
            }
            if (Array.isArray(permsData)) setAllPermissions(permsData);
        } catch {
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage, searchTerm);
    }, [currentPage, fetchData]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchData(1, searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchData]);

    // ── Assign Permission ──
    const openAssignModal = (role: Role) => {
        setSelectedRole(role);
        setCheckedIds(new Set(role.role_permission_trx.map((t) => t.permission.id)));
        setPermSearch("");
        setIsAssignOpen(true);
    };

    const togglePerm = (id: number) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissionIds: Array.from(checkedIds) }),
            });
            if (!res.ok) throw new Error();
            clearPermissionsCache(); // Paksa fetch ulang dari DB
            toast.success(`Permissions untuk "${selectedRole.name}" berhasil disimpan`);
            setIsAssignOpen(false);
            fetchData(currentPage, searchTerm);
        } catch {
            toast.error("Gagal menyimpan permissions");
        } finally {
            setSaving(false);
        }
    };

    // ── Create Role ──
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.name.trim()) {
            toast.error("Nama role wajib diisi");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            toast.success("Role berhasil dibuat");
            setIsCreateOpen(false);
            setCreateForm({ name: "", description: "" });
            fetchData(currentPage, searchTerm);
        } catch (err: any) {
            toast.error(err.message || "Gagal membuat role");
        } finally {
            setCreating(false);
        }
    };

    // ── Delete Role ──
    const handleDeleteRole = async (role: Role) => {
        // if (!confirm(`Hapus role "${role.name}"?`)) return;
        try {
            const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Role berhasil dihapus");
            fetchData(currentPage, searchTerm);
        } catch {
            toast.error("Gagal menghapus role");
        }
    };

    const filteredRoles = roles.filter(
        (r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group permissions by prefix (e.g. "product_view" → group "Product")
    const grouped = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
        const group = p.name.split("_")[0].toUpperCase();
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {});

    const filteredGrouped = Object.entries(grouped).reduce<Record<string, Permission[]>>(
        (acc, [group, perms]) => {
            const matches = perms.filter((p) =>
                p.name.toLowerCase().includes(permSearch.toLowerCase())
            );
            if (matches.length) acc[group] = matches;
            return acc;
        },
        {}
    );

    const totalPerms = roles.reduce((sum, r) => sum + r.role_permission_trx.length, 0);
    const avgPerms = roles.length ? Math.round(totalPerms / roles.length) : 0;

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-2 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                        Management Roles
                    </h2>
                    <p className="text-muted-foreground">
                        Manage user roles and their access permission configurations.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {can(SYSTEM_PERMISSIONS.ROLES_CREATE) && (
                        <ButtonsComponentsAdd addUrl="/roles/create" title="Role" showText />
                    )}
                </div>
            </div>

            <Separator className="bg-zinc-200 dark:bg-zinc-800" />

            {/* Search */}
            <div className="flex items-center gap-4 py-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari peran..."
                        className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-orange-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                        <TableRow>
                            <TableHead className="w-[200px] font-semibold">Name Roles</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="w-[150px] text-center font-semibold">Permissions</TableHead>
                            <TableHead className="w-[100px] text-center font-semibold">Users</TableHead>
                            <TableHead className="w-[150px] font-semibold">Created At</TableHead>
                            <TableHead className="w-[70px] text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                                </TableCell>
                            </TableRow>
                        ) : filteredRoles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRoles.map((role) => (
                                <TableRow key={role.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            {role.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-normal max-w-[300px]">
                                        {role.description || <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => openAssignModal(role)}
                                        >
                                            {role.role_permission_trx.length} Perms
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {role.user_role_trx.length}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(role.created_at).toLocaleDateString("en-US")}
                                    </TableCell>
                                    <TableCell>

                                        <ActionsButtons
                                            viewUrl={can(SYSTEM_PERMISSIONS.ROLES_VIEW) ? `/roles/${role.id}/view` : undefined}
                                            editUrl={can(SYSTEM_PERMISSIONS.ROLES_EDIT) ? `/roles/${role.id}/edit` : undefined}
                                            onDelete={can(SYSTEM_PERMISSIONS.ROLES_DELETE) ? () => handleDeleteRole(role) : undefined}
                                            deleteName={role.name}
                                            deleteDescription={role.description || undefined}
                                            showDelete={can(SYSTEM_PERMISSIONS.ROLES_DELETE)}
                                            showEdit={can(SYSTEM_PERMISSIONS.ROLES_EDIT)}
                                            showView={can(SYSTEM_PERMISSIONS.ROLES_VIEW)}
                                        />

                                        {/* <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer flex items-center gap-2"
                                                    onClick={() => openAssignModal(role)}
                                                >
                                                    <Settings2 className="h-4 w-4" /> Setel Permissions
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400"
                                                    onClick={() => handleDeleteRole(role)}
                                                >
                                                    <Trash2 className="h-4 w-4" /> Hapus Peran
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <PaginationGlobal
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                pageSize={10}
                onPageChange={setCurrentPage}
                label="Roles"
            />

            {/* ── Modal: Assign Permissions ── */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="sm:max-w-[520px] border-none shadow-2xl bg-white dark:bg-zinc-950 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Settings2 className="h-5 w-5 text-orange-500" />
                            Kelola Izin: <span className="text-orange-500">{selectedRole?.name}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Centang permissions yang akan diberikan pada peran ini. Klik Simpan untuk menyimpan.
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="my-2" />

                    {/* Search permissions */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari permission..."
                            className="pl-9 bg-zinc-50 dark:bg-zinc-900"
                            value={permSearch}
                            onChange={(e) => setPermSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[320px] pr-2 mt-1">
                        {Object.keys(filteredGrouped).length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-8 italic">
                                Tidak ada permission ditemukan.
                            </p>
                        ) : (
                            <div className="space-y-5 py-1">
                                {Object.entries(filteredGrouped).map(([group, perms]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded flex items-center gap-1.5">
                                            <Key className="h-3 w-3" /> {group}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-1.5 px-1">
                                            {perms.map((perm) => (
                                                <label
                                                    key={perm.id}
                                                    htmlFor={`perm-${perm.id}`}
                                                    className="flex items-center gap-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 p-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        id={`perm-${perm.id}`}
                                                        checked={checkedIds.has(perm.id)}
                                                        onCheckedChange={() => togglePerm(perm.id)}
                                                    />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium font-mono">{perm.name}</span>
                                                        {perm.description && (
                                                            <span className="text-[11px] text-muted-foreground">{perm.description}</span>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <DialogFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-4 -mx-6 -mb-6 mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{checkedIds.size} permission dipilih</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsAssignOpen(false)} disabled={saving}>
                                Batal
                            </Button>
                            <Button
                                className="bg-orange-600 hover:bg-orange-700 text-white min-w-[130px]"
                                onClick={handleSavePermissions}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Modal: Create Role ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[420px] border-none shadow-2xl bg-white dark:bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <ShieldCheck className="h-5 w-5 text-orange-500" />
                            Tambah Peran Baru
                        </DialogTitle>
                        <DialogDescription>
                            Buat role baru. Setelah disimpan, kamu bisa langsung assign permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateRole} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nama Role <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="contoh: KASIR"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value.toUpperCase() })}
                                className="bg-zinc-50 dark:bg-zinc-900 font-mono"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">Gunakan huruf kapital (contoh: STAFF, MANAGER).</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Deskripsi</label>
                            <Textarea
                                placeholder="Jelaskan fungsi role ini..."
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                className="bg-zinc-50 dark:bg-zinc-900 min-h-[80px]"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
                                disabled={creating}
                            >
                                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Simpan Role
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
