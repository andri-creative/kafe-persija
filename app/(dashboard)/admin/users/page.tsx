import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userApi } from "@/lib/user-api";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface UsersPageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const pageSize = Number(resolvedParams?.pageSize) || 100;

  const result = await userApi.getAll(page, pageSize);
  const { data: users, pagination } = result;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <div>
            <CardTitle className="text-2xl font-black">Users Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your application users and their roles.
            </p>
          </div>
          <Button variant="default" className="cursor-pointer font-bold">
            Tambah User
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />

          {/* Info summary */}
          <div className="mt-4 text-xs text-gray-400 font-medium">
            Total {pagination.totalCount} users found in database.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}