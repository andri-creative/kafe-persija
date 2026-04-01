"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Category } from "../types";
import { getCategoryImageUrl } from "@/lib/category-helper";

interface CategoryListProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
}

export function CategoryList({ categories, selectedCategory, onSelectCategory }: CategoryListProps) {
    return (
        <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Categories</span>
                <div className="h-px flex-1 bg-slate-200/60"></div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl px-2.5 py-1.5 shrink-0 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                    {/* All Category */}
                    <button
                        onClick={() => onSelectCategory("all")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer group active:scale-95",
                            selectedCategory === "all"
                                ? "bg-red-50 border-[#ff3535] text-[#ff3535] shadow-lg shadow-red-500/10"
                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            selectedCategory === "all" ? "bg-red-100/50" : "bg-slate-100 group-hover:bg-slate-200"
                        )}>
                            <Image src="/all.png" alt="All" width={16} height={16} className="object-contain" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight">Semua</span>
                    </button>

                    {/* Dynamic Categories */}
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id.toString())}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer group active:scale-95",
                                selectedCategory === cat.id.toString()
                                    ? "bg-red-50 border-[#ff3535] text-[#ff3535] shadow-lg shadow-red-500/10"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                selectedCategory === cat.id.toString() ? "bg-red-100/50" : "bg-slate-100 group-hover:bg-slate-200"
                            )}>
                                <Image
                                    src={getCategoryImageUrl(cat.image)}
                                    alt={cat.name}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tight">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
