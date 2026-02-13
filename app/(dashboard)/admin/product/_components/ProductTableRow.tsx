"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types/product";
import { formatPrice, formatDate, getCategories, getVariantImage, getActiveVariants, getStatusColor } from "@/lib/product-utils";

interface ProductTableRowProps {
    product: Product;
    onStatusChange: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export const ProductTableRow = ({ product, onStatusChange, onDelete }: ProductTableRowProps) => {
    const activeVariants = getActiveVariants(product.product_variants);
    const categories = getCategories(product);
    const variantImage = getVariantImage(product.product_variants);
    const statusColor = getStatusColor(product.status);

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-3 py-3 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {variantImage ? (
                            <Image
                                src={variantImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                width={48}
                                height={48}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">
                            {product.name}
                        </div>
                        {product.description && (
                            <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                                {product.description}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-3">
                <div className="flex flex-wrap gap-1 max-w-[120px] sm:max-w-none">
                    {categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                            {category}
                        </span>
                    ))}
                    {categories.length > 2 && (
                        <span className="text-[10px] sm:text-xs text-gray-500">+{categories.length - 2}</span>
                    )}
                </div>
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-3">
                <div className="space-y-0.5 sm:space-y-1">
                    {activeVariants.slice(0, 2).map((variant) => (
                        <div key={variant.id} className="text-[11px] sm:text-sm">
                            <span className="text-gray-600">{variant.desc || "Standard"}:</span>{" "}
                            <span className="font-medium">{formatPrice(variant.price)}</span>
                        </div>
                    ))}
                    {activeVariants.length > 2 && (
                        <div className="text-[10px] sm:text-xs text-gray-500">
                            +{activeVariants.length - 2} varian
                        </div>
                    )}
                    {activeVariants.length === 0 && (
                        <div className="text-[10px] sm:text-xs text-gray-500 italic">No variant</div>
                    )}
                </div>
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-3">
                <div className="flex flex-col items-start gap-1.5 sm:gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusColor}`}>
                        {product.status}
                    </span>
                    <Switch
                        className="scale-75 sm:scale-90 origin-left"
                        checked={product.status === "active"}
                        onCheckedChange={() => onStatusChange(product.id, product.status)}
                        disabled={product.status === "Non Stok"}
                    />
                </div>
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-3 text-[11px] sm:text-sm text-gray-500">
                <div>{formatDate(product.created_at)}</div>
                {product.updated_at !== product.created_at && (
                    <div className="text-[9px] sm:text-xs text-gray-400">
                        Updated: {formatDate(product.updated_at)}
                    </div>
                )}
            </td>

            <td className="px-3 py-3 sm:px-4 sm:py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <MoreHorizontalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[140px] sm:min-w-[160px]">
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/product/${product.id}/view`} className="text-xs sm:text-sm">View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/product/${product.id}/edit`} className="text-xs sm:text-sm">Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/product/${product.id}/variants`} className="text-xs sm:text-sm">Variants</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(product.id)}
                            className="text-xs sm:text-sm cursor-pointer"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
};