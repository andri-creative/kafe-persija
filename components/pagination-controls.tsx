"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export default function PaginationControls({ pagination }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    const handlePageSizeChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("pageSize", value);
        params.set("page", "1"); // Reset ke halaman pertama
        router.push(`?${params.toString()}`);
    };

    // Generate array of page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // Jumlah halaman di kiri dan kanan halaman aktif
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= pagination.totalPages; i++) {
            if (
                i === 1 ||
                i === pagination.totalPages ||
                (i >= pagination.page - delta && i <= pagination.page + delta)
            ) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Pagination>
                <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                        <PaginationPrevious
                            href={createPageURL(pagination.page - 1)}
                            aria-disabled={!pagination.hasPreviousPage}
                            tabIndex={!pagination.hasPreviousPage ? -1 : undefined}
                            className={
                                !pagination.hasPreviousPage
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                            onClick={(e) => {
                                if (!pagination.hasPreviousPage) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum, index) => (
                        <PaginationItem key={`page-${index}`}>
                            {pageNum === "..." ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href={createPageURL(pageNum)}
                                    isActive={pagination.page === pageNum}
                                >
                                    {pageNum}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next Button */}
                    <PaginationItem>
                        <PaginationNext
                            href={createPageURL(pagination.page + 1)}
                            aria-disabled={!pagination.hasNextPage}
                            tabIndex={!pagination.hasNextPage ? -1 : undefined}
                            className={
                                !pagination.hasNextPage
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                            onClick={(e) => {
                                if (!pagination.hasNextPage) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Baris per halaman:
                </span>
                <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                >
                    <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder={pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50, 100].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}