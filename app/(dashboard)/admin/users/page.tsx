import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { userApi } from "@/lib/user-api";
import PaginationControls from "@/components/pagination-controls"; // Komponen baru

interface UsersPageProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // Parse query parameters
  const page = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10;

  // Get paginated data
  const result = await userApi.getAll(page, pageSize);
  const { data: users, pagination } = result;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Users</CardTitle>
          <Button variant="default" className="cursor-pointer">
            Tambah User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any, index: number) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>{u.nickname || u.name || "-"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">
                    {u.type || u.role || "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {u.status || "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          Show
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" className="cursor-pointer">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    Tidak ada data user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls pagination={pagination} />
            </div>
          )}

          {/* Info pagination summary */}
          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {users.length} dari {pagination.totalCount} data
            (Halaman {pagination.page} dari {pagination.totalPages})
          </div>
        </CardContent>
      </Card>
    </>
  );
}