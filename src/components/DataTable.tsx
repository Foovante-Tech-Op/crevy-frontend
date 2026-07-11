"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  className?: string;
  align?: "left" | "right" | "center";
  render: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  // Pagination State
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // Optional row interaction
  onRowClick?: (item: T, index: number) => void;
  getRowKey?: (item: T, index: number) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  loadingMessage = "Loading directory records...",
  emptyMessage = "No records matched your search parameters.",
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200 rounded-none overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "py-4 px-6 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 select-none",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-24 text-center text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
                >
                  <span className="inline-block w-2 h-2 bg-brand rounded-none animate-ping mr-2 align-middle" />
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-24 text-center text-slate-400 font-light text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={getRowKey ? getRowKey(item, rowIdx) : rowIdx}
                  onClick={
                    onRowClick ? () => onRowClick(item, rowIdx) : undefined
                  }
                  className={cn(
                    "group hover:bg-slate-50/60 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "py-6 px-6 align-middle text-slate-900 text-sm",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Institutional Pagination Panel ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-background">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Page{" "}
            <span className="text-slate-900 tabular-nums">{currentPage}</span>{" "}
            of <span className="text-slate-900 tabular-nums">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 border border-slate-200 rounded-none text-slate-600 bg-white hover:border-slate-900 hover:text-foreground disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 border border-slate-200 rounded-none text-slate-600 bg-white hover:border-slate-900 hover:text-foreground disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
