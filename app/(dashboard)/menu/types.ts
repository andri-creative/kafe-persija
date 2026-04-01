export interface Category {
    id: number;
    name: string;
    image: string | null;
}

export interface ProductVariant {
    id: number;
    price: number;
    desc: string;
    stok: number | null;
    status: boolean;
    product_variant_images: { image: string }[];
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    status: string;
    product_category_trx: { product_category: { id: number; name: string } }[];
    product_variants: ProductVariant[];
}

export interface CartItem {
    id: string; 
    productId: number;
    productName: string;
    variantId: number;
    variantDesc: string;
    price: number;
    quantity: number;
    image: string | null;
}
