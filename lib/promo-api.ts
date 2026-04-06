import axios from "axios";

// Menggunakan rute lokal sesuai api-client.ts
const promoApi = axios.create({
    baseURL: "/api/promo",
    headers: {
        "Content-Type": "application/json",
    },
});

export interface PromoPayload {
    id?: number;
    name?: string;
    title?: string;
    code_promo?: string; 
    description?: string | null;
    desc?: string | null;
    type: "percentage" | "fixed";
    value: number;
    is_active?: boolean;
    status?: string;
    start_date?: string;
    end_date?: string;
    min_order?: number;
    max_usage?: number;
    all_product?: boolean;
    image?: string | null;
}

/**
 * Mengambil daftar promo dari API lokal
 */
export const getPromos = async () => {
    try {
        const response = await promoApi.get("");
        return response.data;
    } catch (error) {
        console.error("Error fetching promos:", error);
        throw error;
    }
};

/**
 * Mengambil data satu promo berdasarkan ID
 */
export const getPromoById = async (id: string | number) => {
    try {
        const response = await promoApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching promo by id:", error);
        throw error;
    }
};

/**
 * Membuat promo baru melalui API lokal
 */
export const createPromo = async (payload: PromoPayload) => {
    try {
        const response = await promoApi.post("", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating promo:", error);
        throw error;
    }
};

/**
 * Update promo yang sudah ada
 */
export const updatePromo = async (payload: PromoPayload) => {
    try {
        const { id, ...data } = payload;
        const response = await promoApi.put(`/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating promo:", error);
        throw error;
    }
};

/**
 * Hapus promo melalui API lokal
 */
export const deletePromo = async (id: number) => {
    try {
        const response = await promoApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting promo:", error);
        throw error;
    }
};

export default promoApi;
