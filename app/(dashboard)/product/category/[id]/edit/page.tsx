"use client";

import { useEffect, useState, use } from "react";
import EditCategory from "../../../_components/edit-category";
import { Loader2 } from "lucide-react";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
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
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                    <p className="text-xs sm:text-sm font-semibold text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <p className="text-sm sm:text-base text-red-500 font-medium">{error || "Category not found"}</p>
            </div>
        );
    }

    return <EditCategory category={category} />;
}