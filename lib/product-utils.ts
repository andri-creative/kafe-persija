import { Product } from "@/types/product";

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export const getCategories = (product: Product) => {
    return product.product_category_trx.map((trx) => trx.product_category.name);
};

export const getVariantImage = (variants: Product["product_variants"]) => {
    for (const variant of variants) {
        if (variant.product_variant_images.length > 0) {
            return variant.product_variant_images[0].image;
        }
    }
    return null;
};

export const getActiveVariants = (variants: Product["product_variants"]) => {
    return variants.filter((v) => v.status === false);
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-800";
        case "Non Stok":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-red-100 text-red-800";
    }
};