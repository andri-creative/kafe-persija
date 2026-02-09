// /app/admin/product/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Type untuk product sesuai dengan database schema
type Product = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  product_category_trx: {
    product_category: {
      name: string;
    };
  }[];
  product_variants: {
    id: number;
    desc: string | null;
    price: number;
    product_variant_images: {
      image: string;
    }[];
  }[];
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all"); 


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  console.log("Produk Status", products.map((product) => product.status))

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || product.status === selectedStatus;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const statusPriority: { [key: string]: number } = {
      active: 1,
      inactive: 2,
      "Non Stok": 3,
    };

    const priorityA = statusPriority[a.status] || 4;
    const priorityB = statusPriority[b.status] || 4;

    return priorityA - priorityB;
  });

  // Handle delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal menghapus produk");
      }

      // Hapus dari state
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produk berhasil dihapus");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus produk",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format harga
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get categories from product
  const getCategories = (product: Product) => {
    return product.product_category_trx.map((trx) => trx.product_category.name);
  };

  // Get first variant image
  const getVariantImage = (variants: Product["product_variants"]) => {
    for (const variant of variants) {
      if (variant.product_variant_images.length > 0) {
        return variant.product_variant_images[0].image;
      }
    }
    return null;
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      console.log("🚀 ~ handleStatusChange ~ response:", response)

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal mengubah status");
      }

      // Update status di state
      setProducts(products.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      ));
      toast.success("Status berhasil diubah");
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah status",
      );
    }
  };


  if (loading) {
    return (
      <div className="p-6">
        <ToastContainer />
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Memuat data produk...</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="p-6 space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600">
            {products.length} produk ditemukan • Kelola produk, kategori, dan
            varian
          </p>
        </div>

        <Link
          href="/admin/product/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Produk
        </Link>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            {/* Get unique status values */}
            {Array.from(new Set(products.map((p) => p.status))).map(
              (status) => (
                <option key={status} value={status}>
                  {status === "active"
                    ? "Active"
                    : status === "inactive"
                      ? "Inactive"
                      : status === "Non Stok"
                        ? "Non Stok"
                        : status}
                </option>
              ),
            )}
          </select>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href="/admin/product/category"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center"
            >
              Kelola Kategori
            </Link>
            <button
              onClick={fetchProducts}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant & Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {search
                      ? "Produk tidak ditemukan"
                      : "Belum ada produk. Mulai dengan menambahkan produk pertama!"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {/* Product Image */}
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg mr-3 overflow-hidden bg-gray-100">
                          {getVariantImage(product.product_variants) ? (
                            <Image
                              src={
                                getVariantImage(product.product_variants) || ""
                              }
                              alt={product.name}
                              className="h-full w-full object-cover"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getCategories(product).map((category, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {product.product_variants.slice(0, 2).map((variant) => (
                          <div key={variant.id} className="text-sm">
                            <span className="text-gray-600">
                              {variant.desc || "Standard"}:
                            </span>{" "}
                            <span className="font-medium">
                              {formatPrice(variant.price)}
                            </span>
                          </div>
                        ))}
                        {product.product_variants.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{product.product_variants.length - 2} varian
                            lainnya
                          </div>
                        )}
                        {product.product_variants.length === 0 && (
                          <div className="text-xs text-gray-500 italic">
                            Belum ada varian
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center flex-col gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "Non Stok"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status}
                      </span>
                      <Switch className="cursor-pointer"
                        checked={product.status === "active"}
                        onCheckedChange={() =>
                          handleStatusChange(product.id, product.status)
                        }
                        disabled={product.status === "Non Stok"}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <div>Dibuat: {formatDate(product.created_at)}</div>
                        {product.updated_at !== product.created_at && (
                          <div className="text-xs text-gray-400">
                            Diupdate: {formatDate(product.updated_at)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium cursor-pointer">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/admin/product/${product.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href={`/admin/product/${product.id}/variants`}
                            >
                              Variants
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION & INFO */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Menampilkan {filteredProducts.length} dari {products.length} produk
            {search && ` • Pencarian: "${search}"`}
            {selectedStatus !== "all" && ` • Status: ${selectedStatus}`}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={filteredProducts.length <= 10}
            >
              Previous
            </button>
            <button className="px-3 py-1 border rounded-lg bg-blue-600 text-white">
              1
            </button>
            <button
              className="px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={filteredProducts.length <= 10}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada produk
          </h3>
          <p className="text-gray-500 mb-6">
            Mulai dengan menambahkan produk pertama Anda
          </p>
          <Link
            href="/admin/product/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={20} />
            Tambah Produk Pertama
          </Link>
        </div>
      )}
    </div>
  );
}
