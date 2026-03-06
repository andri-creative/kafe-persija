"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, ArrowRightLeft, Folder, Check } from "lucide-react";
import { toast } from "react-toastify";
import { use } from "react";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";
import { clearPermissionsCache } from "@/hooks/use-permissions";

interface Permission {
    id: number;
    name: string;
    description?: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    role_permission_trx: { permission: Permission }[];
    child_roles?: { child_role: Role }[];
}

export default function RoleViewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [role, setRole] = useState<Role | null>(null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allPerms, setAllPerms] = useState<Permission[]>([]);

    // Assigned States
    const [assignedPerms, setAssignedPerms] = useState<Permission[]>([]);
    const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);

    // Search
    const [leftSearch, setLeftSearch] = useState("");
    const [rightSearch, setRightSearch] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [roleRes, permsRes, allRolesRes] = await Promise.all([
                fetch(`/api/roles/${id}`),
                fetch("/api/permissions?all=true"),
                fetch("/api/roles?all=true")
            ]);

            if (!roleRes.ok) throw new Error("Gagal mengambil data role");
            const roleData: Role = await roleRes.json();

            if (permsRes.ok) {
                const permsData = await permsRes.json();
                const uniquePerms = Array.from(new Map(permsData.map((p: Permission) => [p.id, p])).values()) as Permission[];
                uniquePerms.sort((a, b) => a.name.localeCompare(b.name));
                setAllPerms(uniquePerms);
            }
            if (allRolesRes.ok) {
                const rolesData = await allRolesRes.json();
                const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData.data || []);
                const uniqueRoles = Array.from(new Map(rolesArray.map((r: Role) => [r.id, r])).values()) as Role[];
                setAllRoles(uniqueRoles);
            }

            setRole(roleData);

            const dbAssigned = roleData.role_permission_trx.map((trx) => trx.permission);
            const uniqueAssigned = Array.from(new Map(dbAssigned.map((p) => [p.id, p])).values()) as Permission[];
            uniqueAssigned.sort((a, b) => a.name.localeCompare(b.name));
            setAssignedPerms(uniqueAssigned);
            const dbAssignedRoles = roleData.child_roles ? roleData.child_roles.map((trx: any) => trx.child_role) : [];
            const uniqueAssignedRoles = Array.from(new Map(dbAssignedRoles.map((r: any) => [r.id, r])).values()) as Role[];
            setAssignedRoles(uniqueAssignedRoles);

        } catch (error: any) {
            toast.error(error.message);
            router.push("/roles");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSavePerms = async (newAssignedIds: number[]) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/roles/${id}/permissions`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissionIds: newAssignedIds }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan permissions");

            clearPermissionsCache();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (perm: Permission) => {
        setAssignedPerms(prev => {
            const isAssigned = prev.some((p) => p.id === perm.id);
            let newAssigned;
            if (isAssigned) {
                newAssigned = prev.filter((p) => p.id !== perm.id);
            } else {
                newAssigned = [...prev, perm];
            }
            newAssigned.sort((a, b) => a.name.localeCompare(b.name));
            handleSavePerms(newAssigned.map((p) => p.id));
            return newAssigned;
        });
    };

    const handleSaveRoles = async (newAssignedIds: number[]) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/roles/${id}/roles`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleIds: newAssignedIds }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan roles");

            clearPermissionsCache();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (r: Role) => {
        if (r.id === parseInt(id)) return;
        setAssignedRoles(prev => {
            const isAssigned = prev.some((ar) => ar.id === r.id);
            let newAssigned;
            if (isAssigned) {
                newAssigned = prev.filter((ar) => ar.id !== r.id);
            } else {
                newAssigned = [...prev, r];
            }
            handleSaveRoles(newAssigned.map((ar) => ar.id));
            return newAssigned;
        });
    };

    const clearAllPerms = () => {
        setAssignedPerms([]);
        handleSavePerms([]);
    };

    const clearAllRoles = () => {
        setAssignedRoles([]);
        handleSaveRoles([]);
    };

    const addAllPerms = () => {
        setAssignedPerms([...allPerms]);
        handleSavePerms(allPerms.map(p => p.id));
    };

    if (!role && loading) {
        // Return a fast skeleton rather than a blocking spinner
        return (
            <div className="flex-1 p-4 md:p-6 pt-2 font-sans bg-slate-50 dark:bg-[#131720] min-h-screen opacity-50 animate-pulse">
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="h-[80vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
        );
    }

    // Filters
    const leftRolesFiltered = allRoles.filter(r => r.name.toLowerCase().includes(leftSearch.toLowerCase()));
    const leftPermsFiltered = allPerms.filter(p => p.name.toLowerCase().includes(leftSearch.toLowerCase()));
    const rightRolesFiltered = assignedRoles.filter(r => r.name.toLowerCase().includes(rightSearch.toLowerCase()));
    const rightPermsFiltered = assignedPerms.filter(p => p.name.toLowerCase().includes(rightSearch.toLowerCase()));

    return (
        <div className="flex-1 p-4 md:p-6 pt-2 font-sans bg-slate-50 dark:bg-[#131720] min-h-screen">
            <div className="flex items-center gap-4 mb-4">
                <ButtonsComponentsBack backUrl="/roles" title={`Manage Target: ${role?.name || ""}`} showText />
                {saving && <span className="text-xs font-semibold text-blue-500 ml-auto animate-pulse flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Auto-saving...</span>}
            </div>

            <div className="bg-white dark:bg-[#161a25] border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-[#5e6a84] font-bold tracking-widest uppercase mb-1">Role Name</p>
                        <p className="text-base font-bold text-blue-900 dark:text-blue-100">{role?.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-[#5e6a84] font-bold tracking-widest uppercase mb-1">Description</p>
                        <p className="text-base text-slate-800 dark:text-slate-300">{role?.description || "Tidak ada deskripsi"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-[#5e6a84] font-bold tracking-widest uppercase mb-1">Created At</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {role?.created_at ? new Date(role.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-[#5e6a84] font-bold tracking-widest uppercase mb-1">Updated At</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {role?.updated_at ? new Date(role.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : "-"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center mx-auto h-[80vh]">

                {/* LEFT PANEL: SYSTEM DIRECTORY */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#161a25] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0 bg-slate-50/50 dark:bg-transparent">
                        <h2 className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-[#5e6a84] mb-4 uppercase">System Directory (All)</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search system items..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1b212c] border border-slate-300 dark:border-slate-700/50 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                                value={leftSearch}
                                onChange={(e) => setLeftSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 space-y-8">
                        {/* LEFT ROLES */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#5e6a84] tracking-wider uppercase">Available Roles</h3>
                                <button onClick={() => setAssignedRoles(allRoles.filter(r => r.id !== parseInt(id)))} className="text-[10px] font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 uppercase tracking-wider transition-colors">Add All</button>
                            </div>
                            <div className="space-y-1.5">
                                {leftRolesFiltered.filter(r => r.id !== parseInt(id)).map((r) => {
                                    const isAssigned = assignedRoles.some(ar => ar.id === r.id);
                                    return (
                                        <div
                                            key={`left-role-${r.id}`}
                                            onClick={() => toggleRole(r)}
                                            className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isAssigned
                                                ? "border-blue-300 dark:border-blue-600/50 bg-blue-50 dark:bg-[#1e2a40] shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                                                : "border-slate-200 dark:border-[#2a3142] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-[#1b212c] bg-white dark:bg-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder className={`h-4 w-4 ${isAssigned ? "text-blue-500 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"}`} />
                                                <span className={`text-sm font-semibold ${isAssigned ? "text-blue-800 dark:text-blue-100" : "text-slate-700 dark:text-slate-300"}`}>{r.name}</span>
                                            </div>
                                            {isAssigned ? (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* LEFT PERMISSIONS */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#5e6a84] tracking-wider uppercase">Available Permissions</h3>
                                <button onClick={addAllPerms} className="text-[10px] font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 uppercase tracking-wider transition-colors">Add All</button>
                            </div>
                            <div className="space-y-1.5">
                                {leftPermsFiltered.map((p) => {
                                    const isAssigned = assignedPerms.some(ap => ap.id === p.id);
                                    return (
                                        <div
                                            key={`left-perm-${p.id}`}
                                            onClick={() => togglePermission(p)}
                                            className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isAssigned
                                                ? "border-emerald-300 dark:border-[#1e3a30] bg-emerald-50 dark:bg-[#122b22] shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                                                : "border-slate-200 dark:border-[#2a3142] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-[#1b212c] bg-white dark:bg-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2 w-2 rounded-full ${isAssigned ? "bg-emerald-500 dark:bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-300 dark:bg-slate-400"}`} />
                                                <span className={`text-sm font-mono font-medium ${isAssigned ? "text-emerald-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300"}`}>{p.name}</span>
                                            </div>
                                            {isAssigned && (
                                                <Check className="h-4 w-4 text-emerald-600 dark:text-[#10b981]" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SEPARATOR */}
                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-[#161a25] border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-md dark:shadow-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1e2330] hover:scale-105 active:scale-95 transition-all">
                        <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                    </div>
                </div>

                {/* RIGHT PANEL: ASSIGNED DIRECTORY */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#161a25] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0 bg-slate-50/50 dark:bg-transparent">
                        <h2 className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-[#5e6a84] mb-4 uppercase">Permissions In This Role ({role?.name})</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search assigned permissions..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1b212c] border border-slate-300 dark:border-slate-700/50 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                                value={rightSearch}
                                onChange={(e) => setRightSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 space-y-8 bg-white dark:bg-[#161a25]/50">
                        {/* ASSIGNED ROLES */}
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                                <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#5e6a84] tracking-wider uppercase">Assigned Roles</h3>
                                <button onClick={clearAllRoles} className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider transition-colors">Clear</button>
                            </div>
                            <div className="space-y-1.5">
                                {rightRolesFiltered.length === 0 && (
                                    <p className="text-xs text-slate-500 italic py-2">No roles assigned.</p>
                                )}
                                {rightRolesFiltered.map((r) => (
                                    <div
                                        key={`right-role-${r.id}`}
                                        onClick={() => toggleRole(r)}
                                        className="flex items-center justify-between p-3 rounded-lg border border-blue-300 dark:border-blue-600/50 bg-blue-50 dark:bg-[#1e2a40] cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-500/50 group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-transparent text-blue-600 dark:text-blue-400 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                                                <Folder className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 group-hover:hidden">{r.name}</span>
                                                <span className="text-sm font-semibold text-red-500 dark:text-red-400 hidden group-hover:block line-through">{r.name}</span>
                                                <span className="text-[10px] text-blue-600 dark:text-blue-300/70 group-hover:hidden">Inherited Role</span>
                                                <span className="text-[10px] text-red-500 dark:text-red-400 hidden group-hover:block">Click to remove</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(59,130,246,0.8)] group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ASSIGNED PERMISSIONS */}
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 pt-2">
                                <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#5e6a84] tracking-wider uppercase">Assigned Permissions</h3>
                                <button onClick={clearAllPerms} className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider transition-colors">Clear</button>
                            </div>
                            <div className="space-y-1.5">
                                {rightPermsFiltered.length === 0 && (
                                    <p className="text-xs text-slate-500 italic py-2">No permissions assigned.</p>
                                )}
                                {rightPermsFiltered.map((p) => (
                                    <div
                                        key={`right-perm-${p.id}`}
                                        onClick={() => togglePermission(p)}
                                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-[#2a3142] bg-white dark:bg-transparent cursor-pointer hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 group transition-all"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:line-through">{p.name}</span>
                                            <span className="text-[10px] text-red-500 dark:text-red-400 hidden group-hover:block mt-0.5">Click to remove</span>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}