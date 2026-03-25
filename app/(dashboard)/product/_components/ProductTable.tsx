"use client";

import { Product } from "@/types/product";
import { ProductTableRow } from "./ProductTableRow";

interface ProductTableProps {
    products: Product[];
    onStatusChange: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export const ProductTable = ({ products, onStatusChange, onDelete }: ProductTableProps) => {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-sm text-gray-500">Produk tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] lg:min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produk
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Varian & Harga
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <ProductTableRow
                                key={product.id}
                                product={product}
                                onStatusChange={onStatusChange}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
