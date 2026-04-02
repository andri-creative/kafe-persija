"use client";

import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getVariantImageUrl } from "@/lib/variant-helper";

interface VariantImageGalleryProps {
  existingImages: { id: number; image: string }[];
  imagePreviews: string[];
  onRemoveImage: (type: "new" | "existing", index: number) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function VariantImageGallery({
  existingImages,
  imagePreviews,
  onRemoveImage,
  onImageUpload,
  saving,
  fileInputRef,
}: VariantImageGalleryProps) {
  return (
    <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden h-fit">
      <CardHeader className="bg-slate-50/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest pl-1">
          Variant Gallery
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
          Manage visual assets
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* GALLERY DISPLAY */}
          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                  <img
                    src={getVariantImageUrl(img.image)}
                    alt="Existing variant asset"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-xl"
                      onClick={() => onRemoveImage("existing", index)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-indigo-200 border-dashed shadow-lg">
                  <img
                    src={preview}
                    alt="New asset preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-xl"
                      onClick={() => onRemoveImage("new", index)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-indigo-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase leading-none">NEW</div>
                </div>
              ))}
            </div>
          )}

          {/* UPLOAD TRIGGER */}
          <div
            className="w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 hover:border-indigo-400 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={onImageUpload}
              disabled={saving}
            />
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
              {(existingImages.length > 0 || imagePreviews.length > 0) ? "ADD MORE" : "UPLOAD IMAGE"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest text-center">
              MAX 5MB IMAGE
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
