export type Product = {
    id: number;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    product_category_trx: {
        product_category: {
            name: string;
        };
    }[];
    product_variants: {
        id: number;
        desc: string | null;
        price: number;
        status: boolean;
        product_variant_images: {
            image: string;
        }[];
    }[];
};

export type ProductFilter = {
    search: string;
    status: string;
};

export const STATUS_PRIORITY: Record<string, number> = {
    active: 1,
    inactive: 2,
    "Non Stok": 3,
};