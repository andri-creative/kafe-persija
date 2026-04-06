"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "../data-table";
import Link from "next/link";

interface UsersViewClientProps {
    users: any[];
    columns: any[];
    totalCount: number;
}

export function UsersViewClient({ users, columns, totalCount }: UsersViewClientProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <div>
                        <CardTitle className="text-2xl font-black">Users Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your application users and their roles.
                        </p>
                    </div>
                    <Link href="/users/new">
                        <Button variant="default" className="cursor-pointer font-bold">
                            Tambah User
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={users} />

                    {/* Info summary */}
                    <div className="mt-4 text-xs text-gray-400 font-medium">
                        Total {totalCount} users found in database.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
