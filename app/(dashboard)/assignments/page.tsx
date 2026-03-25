"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { PaginationGlobal } from "@/components/paginate-global";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const { can } = usePermissions();

    const fetchData = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "10", search });
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`/api/users?${params}`),
                fetch("/api/roles?all=true"), // Get all roles for the select dropdown
            ]);

            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();

            if (usersData.users) {
                setUsers(usersData.users);
                setTotalPages(Math.ceil(usersData.total / usersData.limit));
                setTotal(usersData.total);
            }
            if (Array.isArray(rolesData)) {
                setRoles(rolesData);
            }
        } catch {
            toast.error("Gagal memuat data users & roles");
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

    const handleRoleChange = async (userId: number, newRoleId: string) => {
        if (!newRoleId || newRoleId === "unassigned") return;

        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: parseInt(newRoleId) }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal mengupdate role");
            }

            toast.success("Role user berhasil diupdate");
            // Refresh table
            fetchData(currentPage, searchTerm);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-2 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                        Role Assignments
                    </h2>
                    <p className="text-muted-foreground">
                        Assign operational roles directly to users in the system.
                    </p>
                </div>
            </div>

            {/* Quick Search */}
            <div className="flex items-center gap-4 py-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500"
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
                            <TableHead className="w-[80px] text-center font-semibold">No</TableHead>
                            <TableHead className="font-semibold">User</TableHead>
                            <TableHead className="w-[180px] text-center font-semibold">Current Role</TableHead>
                            <TableHead className="w-[220px] text-right font-semibold pr-6">Action (Assign Role)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => {
                                const currentRoleId = user.user_role_trx?.[0]?.role_id?.toString() || "";
                                const currentRoleName = user.user_role_trx?.[0]?.role?.name || "Unassigned";

                                return (
                                    <TableRow key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                            {((currentPage - 1) * 10) + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-foreground">{user.nickname}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {currentRoleId ? (
                                                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">
                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                    {currentRoleName}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {updatingId === user.id ? (
                                                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </div>
                                            ) : (
                                                <Select
                                                    value={currentRoleId}
                                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                                // Jika butuh dikunci berdasarkan permission, bisa tambah disabled={!can(SYSTEM_PERMISSIONS.ROLES_EDIT)}
                                                >
                                                    <SelectTrigger className="w-[180px] ml-auto h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((r) => (
                                                            <SelectItem key={r.id} value={r.id.toString()} className="text-xs">
                                                                {r.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
                label="Users"
            />
        </div>
    );
}