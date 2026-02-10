"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data?: {
    id: number;
    name: string;
    image?: string;
  } | null;
};

export default function CategoryForm({
  open,
  onClose,
  onSuccess,
  data,
}: Props) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isEdit = Boolean(data?.id);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setPreview(data.image || null);
    } else {
      setName("");
      setImage(null);
      setPreview(null);
    }
  }, [data, open]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    await fetch(isEdit ? `/api/categories/${data?.id}` : "/api/categories", {
      method: isEdit ? "PUT" : "POST",
      body: formData,
    });

    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }}
          />

          {preview && (
            <Image
              src={preview}
              alt="Preview"
              width={100}
              height={100}
              className="rounded object-cover"
            />
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{isEdit ? "Update" : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
