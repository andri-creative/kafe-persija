"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Key,
    Search,
    Lock,
    Unlock,
    Loader2,
    ListFilter,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "react-toastify";
import ActionsButtons from "@/components/acctions-buttons";
import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { ButtonsComponentsAdd } from "@/components/buttons-conponents";
import { PaginationGlobal } from "@/components/paginate-global";

export default function PermissionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const { can } = usePermissions();

    useEffect(() => {
        fetchPermissions(currentPage, searchTerm);
    }, [currentPage]);

    // Debounce search — reset ke page 1 setiap kali search berubah
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchPermissions(1, searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPermissions = async (page: number, search: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), search });
            const res = await fetch(`/api/permissions?${params}`);
            const data = await res.json();
            if (data.data) {
                setPermissions(data.data);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            } else {
                setPermissions([]);
                if (data.error) toast.error(data.error);
            }
        } catch {
            toast.error("Failed to load permissions");
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const previousPermissions = [...permissions];
        setPermissions(permissions.filter(p => p.id !== id));
        setTotal(t => t - 1);

        try {
            const res = await fetch(`/api/permissions/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Permission deleted successfully");
            if (permissions.length === 1 && currentPage > 1) {
                setCurrentPage(p => p - 1);
            } else {
                fetchPermissions(currentPage, searchTerm);
            }
        } catch {
            setPermissions(previousPermissions);
            setTotal(t => t + 1);
            toast.error("Failed to delete permission");
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-2 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                        Management Permissions
                    </h2>
                    <p className="text-muted-foreground">
                        List of all granular access permissions for each system module.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {can(SYSTEM_PERMISSIONS.PERMISSION_CREATE) && (
                        <ButtonsComponentsAdd addUrl="/permissions/create" title="Permission" showText />
                    )}
                </div>
            </div>
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-4 py-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari permission..."
                        className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center font-semibold">No</TableHead>
                            <TableHead className="w-[250px] font-semibold">Name Permission</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="w-[200px] font-semibold">Created At</TableHead>
                            <TableHead className="w-[120px] text-right font-semibold pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                                </TableCell>
                            </TableRow>
                        ) : permissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No permissions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            permissions.map((perm, index) => (
                                <TableRow key={perm.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                        #{(index + 1).toString().padStart(3, '0')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                <Key className="h-3 w-3" />
                                            </div>
                                            {perm.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground italic">
                                        {perm.description || "No description"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(perm.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <ActionsButtons
                                            viewUrl={can(SYSTEM_PERMISSIONS.PERMISSION_VIEW) ? `/permissions/${perm.id}/show` : undefined}
                                            editUrl={can(SYSTEM_PERMISSIONS.PERMISSION_EDIT) ? `/permissions/${perm.id}/edit` : undefined}
                                            onDelete={can(SYSTEM_PERMISSIONS.PERMISSION_DELETE) ? () => handleDelete(perm.id) : undefined}
                                            deleteName={perm.name}
                                            deleteDescription={perm.description || undefined}
                                            showView={can(SYSTEM_PERMISSIONS.PERMISSION_VIEW)}
                                            showEdit={can(SYSTEM_PERMISSIONS.PERMISSION_EDIT)}
                                            showDelete={can(SYSTEM_PERMISSIONS.PERMISSION_DELETE)} />
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
                pageSize={3}
                onPageChange={setCurrentPage}
                label="permissions"
            />
        </div>
    );
}
