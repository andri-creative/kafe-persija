"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ButtonsComponentsBack, ButtonsComponentsAdd } from "@/components/buttons-conponents";
import ActionsButtons from "@/components/acctions-buttons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { getVariantImageUrl } from "@/lib/variant-helper";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { useSession } from "next-auth/react";

import { ProductVariantHeader } from "../../_components/variants/ProductVariantHeader";
import { AddVariantForm } from "../../_components/variants/AddVariantForm";
import { VariantTable } from "../../_components/variants/VariantTable";
import { VariantSummary } from "../../_components/variants/VariantSummary";
import { LogoLoading } from "@/components/logo-loading";

import { usePermissions } from "@/hooks/use-permissions";
import { ShieldAlert } from "lucide-react";

// Type untuk variant
type Variant = {
  id: number;
  desc: string | null;
  price: number;
  stok: number | null;
  size: string | null;
  status: boolean;
  created_at: string;
  product_variant_images: {
    id: number;
    image: string;
  }[];
};

// Type untuk product
type Product = {
  id: number;
  name: string;
  description: string | null;
  product_category_trx: {
    product_category: {
      name: string;
    };
  }[];
};

export default function ProductVariantsPage() {
  const { data: session } = useSession();
  const { can, canAny, loading: permissionsLoading } = usePermissions();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);

  // State untuk form tambah variant
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    desc: "",
    price: "",
    stok: "",
    size: "",
    imageFile: null as File | null,
    imagePreview: "",
  });
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductAndVariants();
    }
  }, [productId]);

  const fetchProductAndVariants = async () => {
    try {
      setLoading(true);

      // Fetch product details
      const productRes = await fetch(`/api/products/${productId}`);
      if (!productRes.ok) throw new Error("Failed to fetch product");
      const productData = await productRes.json();

      setProduct(productData);

      // Fetch variants
      const variantsRes = await fetch(`/api/products/${productId}/variants`);
      const variantsData = await variantsRes.json();

      setVariants(variantsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load product and variant data");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Handle delete variant
  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete variant");
      }

      setVariants(variants.filter((v) => v.id !== variantId));
      toast.success("Variant deleted successfully");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_deleted', productId, variantId });
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete variant",
      );
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size is 5MB");
      return;
    }

    setNewVariant({
      ...newVariant,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  // Remove image
  const handleRemoveImage = () => {
    if (newVariant.imagePreview) {
      URL.revokeObjectURL(newVariant.imagePreview);
    }
    setNewVariant({
      ...newVariant,
      imageFile: null,
      imagePreview: "",
    });
  };

  // Add new variant
  const handleAddVariant = async () => {
    if (!newVariant.desc.trim() || !newVariant.price) {
      toast.error("Description and price are required");
      return;
    }

    if (Number(newVariant.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setAddingVariant(true);

      const formData = new FormData();
      formData.append("desc", newVariant.desc);
      formData.append("price", newVariant.price);
      formData.append("stok", newVariant.stok || "0");
      formData.append("size", newVariant.size || "");
      if (newVariant.imageFile) {
        formData.append("image", newVariant.imageFile);
      }

      const response = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add variant");
      }

      // Add new variant to list
      setVariants([result.data, ...variants]);
      toast.success("Variant added successfully");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_created', productId, variant: result.data });

      // Reset form
      setNewVariant({
        desc: "",
        price: "",
        stok: "",
        size: "",
        imageFile: null,
        imagePreview: "",
      });
      setShowAddForm(false);

      // Clean up URL
      if (newVariant.imagePreview) {
        URL.revokeObjectURL(newVariant.imagePreview);
      }
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add variant",
      );
    } finally {
      setAddingVariant(false);
    }
  };

  const handleToggleStatus = async (variantId: number, checked: boolean) => {
    // Optimistic update
    const previousVariants = [...variants];
    const newVariants = variants.map((v) =>
      v.id === variantId ? { ...v, status: !checked } : v
    );
    setVariants(newVariants);

    try {
      const response = await fetch(`/api/variants/${variantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Variant status updated successfully");

      // Notify other clients
      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_status_updated', productId, variantId, status: !checked });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      setVariants(previousVariants);
    }
  };

  if (loading || permissionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <LogoLoading width={150} height={150} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">
          Validating sessions and permissions...
        </p>
      </div>
    );
  }

  // RBAC: Restricted access (requires at least view permission)
  if (!canAny(["product_view", "product_edit"])) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-200">
          <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">
          You don't have enough permission to view or manage product variants. 
          Please contact your administrator if you believe this is an error.
        </p>
        <Link 
          href="/product" 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-rose-400 mb-4" />
            <h3 className="text-lg font-bold text-rose-900 mb-2">Product Not Found</h3>
            <Link href="/product" className="text-blue-600 hover:underline font-bold text-sm">
              Back to Product List
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <ProductVariantHeader 
        productName={product.name}
        description={product.description}
        categories={product.product_category_trx}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
      />

      {/* ADD VARIANT FORM */}
      {showAddForm && (
        <AddVariantForm 
          newVariant={newVariant}
          setNewVariant={setNewVariant}
          addingVariant={addingVariant}
          onAdd={handleAddVariant}
          onCancel={() => setShowAddForm(false)}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
        />
      )}

      {/* VARIANTS LIST SECTION */}
      <VariantTable 
        variants={variants}
        productId={productId}
        onDelete={handleDeleteVariant}
        onEdit={(id) => router.push(`/product/${productId}/variants/${id}/edit`)}
        onToggleStatus={handleToggleStatus}
        onShowAddForm={() => setShowAddForm(true)}
      />

      {/* SUMMARY SECTION */}
      {variants.length > 0 && (
        <VariantSummary variants={variants} />
      )}
    </div>
  );
}
