"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/category-helper";

interface Category {
    id: number;
    name: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

export default function ViewCategory({ category }: { category: Category }) {
    return (
        <div className="max-w-[280px] mx-auto space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/admin/product/category">
                    <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-3 h-3 mr-0.5" />
                        Back
                    </Button>
                </Link>
                <div className="h-1 w-1 rounded-full bg-blue-500/70" />
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-3 flex items-center gap-3">
                    {/* Image */}
                    <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border">
                        {category.image ? (
                            <Image
                                src={getCategoryImageUrl(category.image)}
                                alt={category.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                <span className="text-[7px] font-medium text-gray-300">No img</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-medium text-blue-600 uppercase mb-0.5">Category</div>
                        <h2 className="text-sm font-semibold text-gray-900 truncate leading-tight">
                            {category.name}
                        </h2>
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <div className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                            <span className="text-[9px] text-gray-500">
                                {new Date(category.created_at).toLocaleDateString("id-ID", {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="bg-gray-50/50 px-3 py-2 border-t border-gray-100">
                    <Link href={`/admin/product/category/${category.id}/edit`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium h-7 rounded-lg">
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
