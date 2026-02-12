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

export function TabelCategory({ categories }: { categories: any[] }) {
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
                src={category.image || ""}
                alt={category.name}
                width={50}
                height={50}
              />
            </TableCell>
            <TableCell>{category.creator_name || "Unknown"}</TableCell>
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
                  <Link href={`/admin/product/category/${category.id}/edit`} className="cursor-pointer">
                    <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                  </Link>
                  <Link href={`/admin/product/category/${category.id}/view`} className="cursor-pointer">
                    <DropdownMenuItem className="cursor-pointer">View</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    Delete
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
