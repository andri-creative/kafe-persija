import LoadingScreen from "@/components/LoadingScrean";

export const ProductLoading = () => {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <LoadingScreen width={120} height={120} />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Memuat data produk...</p>
            </div>
        </div>
    );
};
