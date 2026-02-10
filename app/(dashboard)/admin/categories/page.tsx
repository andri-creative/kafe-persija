import CategoryTable from "./_components/category-table";

export default function CategoryPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage product categories
        </p>
      </div>

      <CategoryTable />
    </div>
  );
}
