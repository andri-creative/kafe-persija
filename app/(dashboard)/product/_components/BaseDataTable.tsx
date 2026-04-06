"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  key?: keyof T | string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface BaseDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function BaseDataTable<T extends { id: number | string }>({
  columns,
  data,
  emptyMessage = "Data tidak ditemukan",
  onRowClick,
  className = "",
}: BaseDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-zinc-900/70 rounded-lg border dark:border-zinc-800 p-8 text-center", className)}>
        <p className="text-xs text-gray-500 dark:text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-zinc-900/70 rounded-lg border dark:border-zinc-800 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-zinc-800/50">
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead
                  key={idx}
                  className={`text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider py-2 ${column.headerClassName || ""} ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-zinc-900/30 divide-y divide-gray-200 dark:divide-zinc-800">
            {data.map((item, rowIdx) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((column, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className={`px-3 py-2 text-xs text-gray-600 dark:text-zinc-400 ${column.className || ""}`}
                  >
                    {column.render
                      ? column.render(item, rowIdx)
                      : (item[column.key as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
