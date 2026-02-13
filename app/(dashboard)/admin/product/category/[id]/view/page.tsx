"use client";

import { useEffect, useState, use } from "react";
import ViewCategory from "../../../_components/view-category";
import { Loader2 } from "lucide-react";

export default function ViewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await fetch(`/api/categories/${id}`);
                if (!res.ok) throw new Error("Category not found");
                const data = await res.json();
                setCategory(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <p className="text-red-500 font-bold">{error || "Category not found"}</p>
            </div>
        );
    }

    return <ViewCategory category={category} />;
}