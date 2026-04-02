"use client";

import { ArrowLeft, Calendar, Edit2, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/category-helper";
import { ButtonsComponentsBack } from "@/components/buttons-conponents";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessControl } from "@/components/rbac/AccessControl";

interface Category {
    id: number;
    name: string;
    image: string | null;
    created_at: string;
    updated_at: string;
    product_count?: number;
    creator_name?: string;
}

export default function ViewCategory({ category }: { category: Category }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <ButtonsComponentsBack backUrl="/product/category" title="Category" showText />
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-none">
                            View Category
                        </h1>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">Category Information</p>
                    </div>
                </div>

                <AccessControl permission="category_edit">
                    <Link href={`/product/category/${category.id}/edit`}>
                        <Button className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                            <Edit2 className="w-3 h-3" />
                            Edit Category
                        </Button>
                    </Link>
                </AccessControl>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Card */}
                <Card className="overflow-hidden border-none shadow-xl bg-linear-to-br from-indigo-500/10 to-blue-500/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Visual</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col items-center">
                        <div className="relative w-full aspect-square md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-2xl group cursor-zoom-in">
                            {category.image ? (
                                <Image
                                    src={getCategoryImageUrl(category.image)}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                                    <Layers className="w-10 h-10 text-slate-300" />
                                    <span className="text-[10px] font-medium text-slate-400">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Badge className="bg-white/90 text-black border-none text-[10px]">View Image</Badge>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none text-[10px] px-3">
                                Active Category
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="md:col-span-2 border-none shadow-lg bg-white">
                    <CardHeader className="border-b border-gray-50 py-4">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            Category Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Name</span>
                                <h3 className="text-sm font-black text-slate-900">{category.name}</h3>
                            </div>

                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created By</span>
                                <h3 className="text-sm font-black text-slate-900">
                                    {category.creator_name || "System"}
                                </h3>
                            </div>

                            <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created Date</span>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-xs font-semibold">
                                        {new Date(category.created_at).toLocaleDateString("id-ID", {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-50" />

                        <div className="flex items-start gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Package className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-indigo-900">Total Related Products</h4>
                                <p className="text-[10px] text-indigo-600 font-medium">All products registered in this category will be summarized here.</p>
                                <div className="mt-2 text-2xl font-black text-indigo-600 flex items-baseline gap-1.5">
                                    {category.product_count ?? 0}
                                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Products</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] text-gray-400 italic text-center pt-4">
                            Last updated: {new Date(category.updated_at).toLocaleString("id-ID")}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
