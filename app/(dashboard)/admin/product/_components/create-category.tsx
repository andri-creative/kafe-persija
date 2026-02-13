"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function CreateCategory({
  onCreated,
}: {
  onCreated: (category: any) => void;
}) {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
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
    setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
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
    console.log("Form submitted!");

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("image", imageFile);
      submitFormData.append("created_by", session?.user?.id || "1");

      console.log("Session user:", session?.user?.id);

      console.log("FormData entries:");
      submitFormData.forEach((value, key) => {
        console.log(key, value);
      });

      const response = await fetch("/api/categories", {
        method: "POST",
        body: submitFormData,
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);

      if (response.ok) {
        toast.success("Category created successfully!");
        console.log("Image saved:", result.image?.filename);

        onCreated(result.data);

        setFormData({ name: "", image: "" });
        setImagePreview(null);
        setImageFile(null);
      } else {
        toast.error(result.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating category");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter category name"
              disabled={uploading}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category Image *
            </label>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${isDragging
                ? "border-blue-500 bg-blue-50"
                : uploading
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-300 hover:border-gray-400"
                } ${uploading ? "cursor-wait" : "cursor-pointer"}`}
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
                required
              />

              {uploading ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="text-sm text-gray-700">Uploading...</p>
                </div>
              ) : imagePreview ? (
                <div className="text-center">
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData({ ...formData, image: "" });
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={uploading}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Drag & drop your image here
                    </p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                    <p className="text-xs text-gray-400">
                      Supports: JPG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={uploading || !formData.name || !imageFile}
          className={`w-full py-3 font-medium rounded-lg transition-colors cursor-pointer ${uploading || !formData.name || !imageFile
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {uploading ? "Creating..." : "Create Category"}
        </Button>
      </form>
    </>
  );
}
