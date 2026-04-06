import { userApi } from "@/lib/user-api";
import { columns } from "./columns";
import { UsersViewClient } from "./_components/UsersViewClient";

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
    <UsersViewClient 
      users={users} 
      columns={columns} 
      totalCount={pagination.totalCount} 
    />
  );
}
