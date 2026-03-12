"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import { use } from "react"; // For resolving the params promise in Next.js 15+

export default function RoleEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Resolve params using React.use()
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await fetch(`/api/roles/${id}`);
                if (!res.ok) throw new Error("Gagal mengambil data role");
                const data = await res.json();
                setForm({
                    name: data.name || "",
                    description: data.description || "",
                });
            } catch (error: any) {
                toast.error(error.message);
                router.push("/roles");
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/roles/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update role");
            }

            toast.success("Role updated successfully");
            router.push("/roles");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 pt-2 min-h-screen max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <ButtonsComponentsBack backUrl="/roles" title="Role" showText />
            </div>

            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-500" />
                        Edit Role Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input
                                placeholder="e.g. SUPER_ADMIN, MANAGER"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                                className="bg-white/50 dark:bg-zinc-900/50 uppercase"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Use UPPERCASE for role names for consistency (e.g., SUPER_ADMIN).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Explain the purpose of this role..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="bg-white/50 dark:bg-zinc-900/50 min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <ButtonsComponentsSave
                                title="Changes"
                                isLoading={saving}
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}