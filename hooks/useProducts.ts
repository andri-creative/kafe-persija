import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Product } from "@/types/product";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { useSession } from "next-auth/react";

export const useProducts = () => {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Gagal memuat data produk");
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

        try {
            setDeletingId(id);
            const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Gagal menghapus produk");
            }
            setProducts(products.filter((p) => p.id !== id));
            toast.success("Produk berhasil dihapus");
            
            // Notify other clients
            const socket = getSocket(session?.user?.auth_token, session?.user?.id);
            socket.emit('product_updated', { action: 'deleted', id });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error instanceof Error ? error.message : "Gagal menghapus produk");
        } finally {
            setDeletingId(null);
        }
    };

    const updateProductStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Gagal mengubah status");
            }

            setProducts(products.map((p) =>
                p.id === id ? { ...p, status: newStatus } : p
            ));
            toast.success("Status berhasil diubah");

            // Notify other clients
            const socket = getSocket(session?.user?.auth_token, session?.user?.id);
            socket.emit('product_updated', { action: 'status_updated', id, status: newStatus });
        } catch (error) {
            console.error("Error changing status:", error);
            toast.error(error instanceof Error ? error.message : "Gagal mengubah status");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        deletingId,
        fetchProducts,
        deleteProduct,
        updateProductStatus,
    };
};