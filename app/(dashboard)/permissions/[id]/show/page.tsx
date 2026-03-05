import { notFound } from "next/navigation";
import { getPermissionById } from "@/services/permission.service";
import {
    ArrowLeft,
    Key,
    Edit2,
    Shield,
    Calendar,
    Clock,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";

export default async function PermissionShowPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const permission = await getPermissionById(Number(id));

    if (!permission) notFound();

    const roles = permission.role_permission_trx?.map((trx) => trx.role) ?? [];

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <ButtonsComponentsBack backUrl="/permissions" title="Permission" showText />
                </div>
                <Link href={`/permissions/${id}/edit`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            {/* Main Info Card */}
            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-500" />
                        Permission Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Tag className="h-3 w-3" /> Name Permission
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Key className="h-4 w-4" />
                            </div>
                            <span className="text-base font-semibold font-mono">{permission.name}</span>
                        </div>
                    </div>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    {/* Description */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                            {permission.description || "No description"}
                        </p>
                    </div>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" /> Created At
                            </p>
                            <p className="text-sm">{formatDate(permission.created_at)}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="h-3 w-3" /> Updated At
                            </p>
                            <p className="text-sm">{formatDate(permission.updated_at)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assigned Roles Card */}
            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Roles that have this permission
                        <Badge variant="secondary" className="ml-auto text-xs">
                            {roles.length} role
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {roles.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-6">
                            No roles assigned to this permission.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
                                >
                                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        {role.name}
                                    </span>
                                    {role.description && (
                                        <span className="text-xs text-muted-foreground">
                                            — {role.description}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
