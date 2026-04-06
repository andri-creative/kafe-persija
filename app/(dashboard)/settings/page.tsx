"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
    Settings, 
    Globe, 
    Shield, 
    Plus, 
    Trash2, 
    Save, 
    Loader2, 
    AlertCircle,
    Info
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";
import { AccessControl } from "@/components/rbac/AccessControl";

interface Setting {
    id: number;
    name: string;
    value: string;
    description: string | null;
}

export default function SettingsPage() {
    const { can, loading: permissionsLoading } = usePermissions();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state for new setting
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newValue, setNewValue] = useState("");
    const [newDesc, setNewDesc] = useState("");

    useEffect(() => {
        if (!permissionsLoading && can(SYSTEM_PERMISSIONS.SETTING_VIEW)) {
            fetchSettings();
        }
    }, [permissionsLoading]);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings");
            if (!res.ok) throw new Error("Gagal mengambil data");
            const data = await res.json();
            setSettings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: number, value: string, description: string | null) => {
        setIsSaving(id);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, value, description }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengaturan ini?")) return;
        try {
            const res = await fetch(`/api/settings?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus");
            setSettings(settings.filter(s => s.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, value: newValue, description: newDesc }),
            });
            if (!res.ok) throw new Error("Gagal membuat");
            const created = await res.json();
            setSettings([...settings, created]);
            setShowNewForm(false);
            setNewName("");
            setNewValue("");
            setNewDesc("");
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (permissionsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Memeriksa Hak Akses...</span>
            </div>
        );
    }

    return (
        <AccessControl 
            permission={SYSTEM_PERMISSIONS.SETTING_VIEW}
            fallback={
                <div className="flex-1 flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <AlertCircle className="h-16 w-16 text-destructive opacity-50" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
                        <p className="text-muted-foreground">Anda tidak memiliki izin untuk melihat Pengaturan Sistem.</p>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
                        <p className="text-muted-foreground">
                            Kelola parameter global aplikasi yang tersimpan di database.
                        </p>
                    </div>
                    <AccessControl permission={SYSTEM_PERMISSIONS.SETTING_CREATE}>
                        <Button onClick={() => setShowNewForm(!showNewForm)} className="gap-2">
                            {showNewForm ? <Info className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {showNewForm ? "Batal" : "Tambah Baru"}
                        </Button>
                    </AccessControl>
                </div>
                
                <Separator />

                {error && (
                    <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center h-[40vh]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Memuat Pengaturan...</span>
                    </div>
                ) : (
                    <>
                        <AccessControl permission={SYSTEM_PERMISSIONS.SETTING_CREATE}>
                            {showNewForm && (
                                <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                                    <CardHeader>
                                        <CardTitle>Tambah Parameter Baru</CardTitle>
                                        <CardDescription>Masukkan kunci unik untuk parameter sistem.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nama Parameter (ID)</Label>
                                                <Input placeholder="misal: APP_NAME" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nilai (Value)</Label>
                                                <Input placeholder="Nilai parameter" value={newValue} onChange={(e) => setNewValue(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Deskripsi</Label>
                                                <Input placeholder="Penjelasan kegunaan" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                                            </div>
                                            <div className="md:col-span-3 flex justify-end">
                                                <Button type="submit" className="gap-2">
                                                    <Save className="h-4 w-4" />
                                                    Simpan Parameter
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </AccessControl>

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            {settings.length === 0 && !showNewForm && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
                                    <Settings className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                                    <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
                                    <p className="text-muted-foreground italic">Klik 'Tambah Baru' untuk mengisi parameter pertama.</p>
                                </div>
                            )}
                            
                            {settings.map((setting) => (
                                <Card key={setting.id} className="transition-all hover:shadow-md border-white/20 bg-black/5 backdrop-blur-sm flex flex-col">
                                    <CardHeader className="pb-3 px-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    {setting.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs italic">
                                                    Data ID: #{setting.id}
                                                </CardDescription>
                                            </div>
                                            <AccessControl permission={SYSTEM_PERMISSIONS.SETTING_DELETE}>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(setting.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AccessControl>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 px-6 grow">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={`val-${setting.id}`}>Value (Format JSON)</Label>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-[10px] uppercase font-bold"
                                                    onClick={() => {
                                                        try {
                                                            const obj = JSON.parse(setting.value);
                                                            const prettified = JSON.stringify(obj, null, 2);
                                                            setSettings(settings.map(s => s.id === setting.id ? { ...s, value: prettified } : s));
                                                        } catch (e) {
                                                            alert("Format JSON tidak valid");
                                                        }
                                                    }}
                                                >
                                                    Prettify JSON
                                                </Button>
                                            </div>
                                            <Textarea 
                                                id={`val-${setting.id}`} 
                                                className="font-mono text-sm min-h-[120px] bg-black/20"
                                                value={setting.value} 
                                                readOnly={!can(SYSTEM_PERMISSIONS.SETTING_EDIT)}
                                                placeholder='{"key": "value"}'
                                                onChange={(e) => {
                                                    const newVal = e.target.value;
                                                    setSettings(settings.map(s => s.id === setting.id ? { ...s, value: newVal } : s));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`desc-${setting.id}`}>Deskripsi</Label>
                                            <Textarea 
                                                id={`desc-${setting.id}`}
                                                className="resize-none h-16 text-sm"
                                                value={setting.description || ""} 
                                                readOnly={!can(SYSTEM_PERMISSIONS.SETTING_EDIT)}
                                                onChange={(e) => {
                                                    const newDesc = e.target.value;
                                                    setSettings(settings.map(s => s.id === setting.id ? { ...s, description: newDesc } : s));
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                    <AccessControl permission={SYSTEM_PERMISSIONS.SETTING_EDIT}>
                                        <CardFooter className="bg-primary/5 py-3 px-6 border-t rounded-b-lg">
                                            <Button 
                                                onClick={() => handleUpdate(setting.id, setting.value, setting.description)} 
                                                disabled={isSaving === setting.id}
                                                className="w-full gap-2"
                                                size="sm"
                                            >
                                                {isSaving === setting.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                Simpan Perubahan
                                            </Button>
                                        </CardFooter>
                                    </AccessControl>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AccessControl>
    );
}


