import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontalIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryImageUrl } from "@/lib/category-helper";
import { toast } from "react-toastify";

export function TabelCategory({
  categories,
  onDelete,
}: {
  categories: any[];
  onDelete?: (id: number) => void;
}) {
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Category deleted successfully");
        if (onDelete) {
          onDelete(id);
        } else {
          window.location.reload();
        }
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the category");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-xs">
          <TableHead className="w-[50px]">No</TableHead>
          <TableHead>Nama Kategori</TableHead>
          <TableHead>Gambar</TableHead>
          <TableHead>Dibuat Oleh</TableHead>
          <TableHead className="text-right px-4">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category, index) => (
          <TableRow key={category.id} className="text-xs border-b">
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>
              {category.image ? (
                <div className="relative w-8 h-8 rounded overflow-hidden border bg-gray-50">
                  <Image
                    src={getCategoryImageUrl(category.image)}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-[10px] text-gray-400">Tanpa Gambar</span>
              )}
            </TableCell>
            <TableCell className="text-gray-500">{category.creator_name || "-"}</TableCell>
            <TableCell className="text-right pr-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontalIcon className="h-3 w-3" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs w-32">
                  <Link
                    href={`/product/category/${category.id}/edit`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="cursor-pointer text-xs">
                      Ubah
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href={`/product/category/${category.id}/view`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="cursor-pointer text-xs">
                      Detail
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-xs text-red-600 focus:text-red-700"
                    disabled={category.product_count > 0}
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    Hapus {category.product_count > 0 && "(Digunakan)"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
