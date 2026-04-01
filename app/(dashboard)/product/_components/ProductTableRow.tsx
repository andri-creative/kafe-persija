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
import { Product } from "../types";
import { formatPrice, formatDate, getCategories, getVariantImage, getActiveVariants, getStatusColor } from "@/lib/product-utils";
import { usePermissions } from "@/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@/types/rbac";

interface ProductTableRowProps {
    product: Product;
    onStatusChange: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export const ProductTableRow = ({ product, onStatusChange, onDelete }: ProductTableRowProps) => {
    const { can } = usePermissions();
    const activeVariants = getActiveVariants(product.product_variants);
    const categories = getCategories(product);
    const variantImage = getVariantImage(product.product_variants);
    const statusColor = getStatusColor(product.status);

    const canEditProduct = can(SYSTEM_PERMISSIONS.PRODUCT_EDIT || "product_edit");
    const canViewProduct = can(SYSTEM_PERMISSIONS.PRODUCT_VIEW || "product_view");
    const canDeleteProduct = can(SYSTEM_PERMISSIONS.PRODUCT_DELETE || "product_delete");

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {variantImage ? (
                            <Image
                                src={variantImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <Package className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate max-w-[150px] sm:max-w-[200px]">
                            {product.name}
                        </div>
                        {product.description && (
                            <div className="text-[10px] text-gray-500 truncate max-w-[150px] sm:max-w-[200px]">
                                {product.description}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1 max-w-[120px] sm:max-w-[160px]">
                    {categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded">
                            {category}
                        </span>
                    ))}
                    {categories.length > 2 && (
                        <span className="text-[10px] text-gray-500">+{categories.length - 2}</span>
                    )}
                </div>
            </td>

            <td className="px-3 py-2">
                <div className="space-y-0.5">
                    {activeVariants.slice(0, 2).map((variant) => (
                        <div key={variant.id} className="text-[11px] xl:text-xs">
                            <span className="text-gray-600">{variant.desc || "Standard"}:</span>{" "}
                            <span className="font-medium">{formatPrice(variant.price)}</span>
                        </div>
                    ))}
                    {activeVariants.length > 2 && (
                        <div className="text-[10px] text-gray-500">
                            +{activeVariants.length - 2} varian
                        </div>
                    )}
                    {activeVariants.length === 0 && (
                        <div className="text-[10px] text-gray-500 italic">No variant</div>
                    )}
                </div>
            </td>

            <td className="px-3 py-2">
                <div className="flex flex-col items-start gap-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}>
                        {product.status}
                    </span>
                    <Switch
                        className="scale-75 origin-left"
                        checked={product.status === "active"}
                        onCheckedChange={() => onStatusChange(product.id, product.status)}
                        disabled={product.status === "Non Stok" || !canEditProduct}
                    />
                </div>
            </td>

            <td className="px-3 py-2 text-xs text-gray-500">
                <div>{formatDate(product.created_at)}</div>
                {product.updated_at !== product.created_at && (
                    <div className="text-[10px] text-gray-400 mt-0.5">
                        Updated: {formatDate(product.updated_at)}
                    </div>
                )}
            </td>

            <td className="px-3 py-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontalIcon className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[120px]">
                        {canViewProduct && (
                            <DropdownMenuItem asChild>
                                <Link href={`/product/${product.id}/view`} className="text-xs">View</Link>
                            </DropdownMenuItem>
                        )}
                        {canEditProduct && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/product/${product.id}/edit`} className="text-xs">Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/product/${product.id}/variants`} className="text-xs">Variants</Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        {canDeleteProduct && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(product.id)}
                                    className="text-xs cursor-pointer text-red-600 focus:text-red-700"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
};
