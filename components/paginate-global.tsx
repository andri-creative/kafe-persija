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

interface PaginationGlobalProps {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    /** Label item, default "items" */
    label?: string;
}

export function PaginationGlobal({
    currentPage,
    totalPages,
    total,
    pageSize,
    onPageChange,
    label = "items",
}: PaginationGlobalProps) {
    if (totalPages <= 1 && total === 0) return null;

    // Hitung range item yang ditampilkan
    const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, total);

    // Generate nomor halaman yang tampil (max 5 visible)
    const getPageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "...")[] = [];

        if (currentPage <= 4) {
            // Di awal: 1 2 3 4 5 ... last
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            // Di akhir: 1 ... last-4 last-3 last-2 last-1 last
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            // Di tengah: 1 ... prev curr next ... last
            pages.push(1);
            pages.push("...");
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground px-2 py-3">
            {/* Info count */}
            <div className="text-xs">
                Showing <span className="font-semibold text-foreground">{from} &minus; {to}</span>{" "}
                of <span className="font-semibold text-foreground">{total}</span> {label}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="mx-0 w-auto">
                    <PaginationContent className="gap-1">
                        {/* Prev */}
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1) onPageChange(currentPage - 1);
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        {/* Page numbers */}
                        {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                                <PaginationItem key={`ellipsis-${idx}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === currentPage}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(page as number);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        {/* Next */}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
