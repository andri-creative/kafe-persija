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
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Created By</TableHead>
          {/* <TableHead>Updated At</TableHead> */}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category, index) => (
          <TableRow key={category.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>
              <Image
                src={getCategoryImageUrl(category.image)}
                alt={category.name}
                width={50}
                height={50}
              />
            </TableCell>
            <TableCell>{category.creator_name}</TableCell>
            {/* <TableCell>{category.created_at || ""}</TableCell> */}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link
                    href={`/admin/product/category/${category.id}/edit`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href={`/admin/product/category/${category.id}/view`}
                    className="cursor-pointer"
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      View
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={category.product_count > 0}
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    Delete {category.product_count > 0 && "(In Use)"}
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
