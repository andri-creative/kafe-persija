export type VariantImage = {
  id: number;
  image: string;
};

export type ProductVariant = {
  id: number;
  desc: string | null;
  price: number;
  stok: number | null;
  size: string | null;
  status?: boolean;
  product_variant_images: VariantImage[];
};

export type ProductCategoryTrx = {
  id?: number;
  product_id?: number;
  category_id?: number;
  product_category: {
    id?: number;
    name: string;
  };
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  product_category_trx: ProductCategoryTrx[];
  product_variants: ProductVariant[];
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  image?: string | null;
  product_count?: number;
  creator_name?: string | null;
};

export type CategoryOption = Category;

// Types for forms (Create/Edit)
export type ProductVariantFormData = {
  id?: number;
  desc: string;
  price: string;
  stok: string;
  size: string;
  imageFiles: File[];
  imagePreviews: string[];
  existingImages: { id: number; url: string }[];
  removedImageIds: number[];
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
