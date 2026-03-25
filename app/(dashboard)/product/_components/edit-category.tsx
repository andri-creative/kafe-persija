"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";
import { useRouter } from "next/navigation";
import { getCategoryImageUrl } from "@/lib/category-helper";

interface Category {
    id: number;
    name: string;
    image: string | null;
}

export default function EditCategory({ category }: { category: Category }) {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(getCategoryImageUrl(category.image));
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: category.name,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setImageFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleFileChange({
                target: {
                    files: e.dataTransfer.files,
                },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        setUploading(true);

        try {
            const submitFormData = new FormData();
            submitFormData.append("name", formData.name);
            if (imageFile) {
                submitFormData.append("image", imageFile);
            }

            const response = await fetch(`/api/categories/${category.id}`, {
                method: "PUT",
                body: submitFormData,
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Category updated successfully!");
                router.push("/product/category");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update category");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto px-3 py-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ButtonsComponentsBack backUrl="/product/category" title="Kategori" showText />
                <Separator orientation="vertical" className="mx-2 h-4" />
                <div>
                    <h1 className="text-sm font-bold">Ubah Kategori</h1>
                    <p className="text-[10px] text-muted-foreground">{category.name}</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border shadow-none">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-4 space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-[10px] font-medium">
                                Nama Kategori <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Category name"
                                disabled={uploading}
                                required
                                className="h-8 text-xs px-3"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-1.5">
                            <Label htmlFor="image" className="text-[10px] font-medium">
                                Gambar
                            </Label>
                            <div
                                className={`relative border border-dashed rounded-md transition-all ${isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground/50"
                                    } ${uploading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />

                                {imagePreview ? (
                                    <div className="flex items-center gap-3 p-3">
                                        <div className="relative w-10 h-10 rounded overflow-hidden border shrink-0">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">New image</p>
                                            <p className="text-[10px] text-muted-foreground">Click to change</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImagePreview(null);
                                                setImageFile(null);
                                            }}
                                            className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            disabled={uploading}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium">Upload image</p>
                                            <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP · Max 5MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                            <ButtonsComponentsSave
                                title="Perubahan"
                                isLoading={uploading}
                                disabled={uploading || !formData.name}
                                className="h-8 text-xs min-w-[100px]"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/product/category")}
                                disabled={uploading}
                                className="h-8 text-xs px-4 cursor-pointer"
                            >
                                Batal
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
