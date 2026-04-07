

const BASE_URL = "/api/promo";

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
 * Helper untuk fetch data tanpa axios
 */
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Mengambil daftar promo dari API lokal
 */
export const getPromos = async () => {
    try {
        return await fetcher<any>("");
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
        return await fetcher<any>(`/${id}`);
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
        return await fetcher<any>("", {
            method: "POST",
            body: JSON.stringify(payload),
        });
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
        return await fetcher<any>(`/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
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
        return await fetcher<any>(`/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        console.error("Error deleting promo:", error);
        throw error;
    }
};
