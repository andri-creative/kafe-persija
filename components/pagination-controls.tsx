"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationProps {
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    }
}

export default function PaginationControls({ pagination }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { page, totalPages, hasNextPage, hasPreviousPage } = pagination;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const range = 1;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - range && i <= page + range)
            ) {
                pages.push(i);
            } else if (
                i === page - range - 1 ||
                i === page + range + 1
            ) {
                if (pages[pages.length - 1] !== 'ellipsis') {
                    pages.push('ellipsis');
                }
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        asChild
                        href={hasPreviousPage ? createPageURL(page - 1) : "#"}
                        className={!hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                    >
                        <Link href={hasPreviousPage ? createPageURL(page - 1) : "#"}>Previous</Link>
                    </PaginationPrevious>
                </PaginationItem>

                {pageNumbers.map((p, i) => (
                    <PaginationItem key={i}>
                        {p === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                asChild
                                href={createPageURL(p)}
                                isActive={p === page}
                            >
                                <Link href={createPageURL(p)}>{p}</Link>
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        asChild
                        href={hasNextPage ? createPageURL(page + 1) : "#"}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
                    >
                        <Link href={hasNextPage ? createPageURL(page + 1) : "#"}>Next</Link>
                    </PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
