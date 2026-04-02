"use client";
import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getPromoById, updatePromo } from "@/lib/promo-api";
import { toast } from "react-hot-toast";
import PromoForm from "@/components/promo/PromoForm";

export default function EditPromoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [initialData, setInitialData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchPromo = async () => {
            try {
                const data = await getPromoById(id);
                // Map DB fields to Form fields if necessary
                setInitialData({
                    ...data,
                    name: data.title,
                    description: data.desc
                });
            } catch (error) {
                toast.error("Failed to load promo data");
                router.push("/promo");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchPromo();
    }, [id, router]);

    const handleSubmit = async (formData: any) => {
        try {
            // Validation
            if (!formData.name) {
                toast.error("Judul promo wajib diisi");
                return;
            }
            if (!formData.code_promo) {
                toast.error("Kode voucher wajib diisi");
                return;
            }
            if (!formData.value || formData.value <= 0) {
                toast.error("Nilai diskon harus lebih dari 0");
                return;
            }
            if (!formData.start_date || !formData.end_date) {
                toast.error("Masa berlaku wajib diatur");
                return;
            }

            setIsSaving(true);
            const response = await updatePromo({
                ...formData,
                id: Number(id)
            });
            
            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success("Promo Campaign updated successfully");
            router.push("/promo");
        } catch (error: any) {
            console.error("PUT ERROR:", error);
            const errMsg = error.response?.data?.error || "Failed to update campaign. Please try again.";
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-zinc-50/10">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Loading campaign data...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-10 bg-zinc-50/10 min-h-screen">
            {/* Back Navigation */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Marketing
            </button>

            <PromoForm 
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                title="Edit Promotion"
                subtitle={`Modify rules for campaign #${id}`}
            />
        </div>
    );
}
