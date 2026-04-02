"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, ShieldAlert, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { getProductSocket as getSocket } from "@/lib/product-socket";
import { useSession } from "next-auth/react";
import { LogoLoading } from "@/components/logo-loading";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";

// Sub-components
import { VariantEditForm } from "../../../../_components/variants/VariantEditForm";
import { VariantImageGallery } from "../../../../_components/variants/VariantImageGallery";

// Type definition for variant
type Variant = {  
  id: number;
  desc: string | null;
  price: number;
  stok: number | null;
  size: string | null;
  created_at: string;
  product_variant_images: {
    id: number;
    image: string;
  }[];
  product: {
    id: number;
    name: string;
  };
};

export default function ProductVariantEditPage() {
  const { data: session } = useSession();
  const { can, loading: permissionsLoading } = usePermissions();
  const params = useParams();
  const router = useRouter();

  const variantId = params?.variantId as string;
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variant, setVariant] = useState<Variant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    desc: "",
    price: "",
    stok: "",
    size: "",
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
    existingImages: [] as { id: number; image: string }[],
    removedImageIds: [] as number[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (variantId) fetchVariant();
  }, [variantId]);

  const fetchVariant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/variants/${variantId}`);
      if (!response.ok) throw new Error("Failed to fetch variant data");
      
      const data = await response.json();
      setVariant(data);

      setFormData({
        desc: data.desc || "",
        price: data.price.toString(),
        stok: data.stok?.toString() || "0",
        size: data.size || "",
        imageFiles: [],
        imagePreviews: [],
        existingImages: data.product_variant_images || [],
        removedImageIds: [],
      });
    } catch (error) {
      console.error("Error fetching variant:", error);
      toast.error("Failed to load variant data");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles],
      imagePreviews: [...prev.imagePreviews, ...validFiles.map(file => URL.createObjectURL(file))]
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (type: "new" | "existing", index: number) => {
    if (type === "new") {
      URL.revokeObjectURL(formData.imagePreviews[index]);
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== index),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
      }));
    } else {
      const imageToRemove = formData.existingImages[index];
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        removedImageIds: [...prev.removedImageIds, imageToRemove.id]
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.desc.trim() || !formData.price) {
      toast.error("Description and price are required");
      return;
    }

    if (Number(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      const submitData = new FormData();
      submitData.append("desc", formData.desc);
      submitData.append("price", formData.price);
      submitData.append("stok", formData.stok);
      submitData.append("size", formData.size);

      formData.imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      if (formData.removedImageIds.length > 0) {
        submitData.append("removedImageIds", formData.removedImageIds.join(","));
      }

      const response = await fetch(`/api/variants/${variantId}`, {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save changes");

      toast.success("Variant updated successfully");

      const socket = getSocket(session?.user?.auth_token, session?.user?.id);
      socket.emit('product_updated', { action: 'variant_updated', productId, variantId, data: result.data });

      setTimeout(() => {
        router.push(`/product/${productId}/variants`);
      }, 500);
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
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

  // RBAC Restricted
  if (!can("product_edit")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-200">
          <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">
          You don't have enough permission to edit product variants. 
          Please contact your administrator if you believe this is an error.
        </p>
        <Link 
          href={`/product/${productId}/variants`} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Variants
        </Link>
      </div>
    );
  }

  // Not Found
  if (!variant) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="border-rose-200 bg-rose-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-14 w-14 text-rose-400 mb-4 opacity-50" />
            <h3 className="text-xl font-black text-rose-900 uppercase tracking-widest mb-2">Variant Not Found</h3>
            <p className="text-xs font-bold text-rose-800/60 uppercase mb-6 tracking-widest text-center">
              The requested variant ID [{variantId}] does not exist.
            </p>
            <Link href={`/product/${productId}/variants`} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Back to Variant List
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <ButtonsComponentsBack backUrl={`/product/${productId}/variants`} title="Variants" showText />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Edit Variant: {variant.product.name}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Updating unique ID: <span className="text-indigo-600">[{variant.id}]</span>
            </p>
          </div>
        </div>

        <ButtonsComponentsSave
          title="Save Changes"
          isLoading={saving}
          onClick={() => handleSubmit()}
          className="h-9 px-6 text-xs shadow-lg shadow-indigo-100 ring-1 ring-indigo-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COMPONENTIZED FORM */}
        <div className="lg:col-span-2">
          <VariantEditForm 
            formData={formData} 
            setFormData={setFormData} 
            saving={saving} 
          />
        </div>

        {/* COMPONENTIZED GALLERY */}
        <div className="lg:col-span-1">
          <VariantImageGallery 
            existingImages={formData.existingImages}
            imagePreviews={formData.imagePreviews}
            onRemoveImage={handleRemoveImage}
            onImageUpload={handleImageUpload}
            saving={saving}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>
    </div>
  );
}
