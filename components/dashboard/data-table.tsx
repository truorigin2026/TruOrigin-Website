"use client";

import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

/**
 * Rows must arrive pre-rendered (cells as ReactNode, not cell-functions):
 * this is a Client Component so its parent Server Component pages can pass
 * it plain functions (cell renderers, getRowHref, etc) — Next's RSC
 * boundary only allows serializable values (including rendered elements)
 * across that boundary, not closures.
 */
export type TableRowData = {
  key: string;
  href?: string;
  cells: React.ReactNode[];
};

export function DataTable({
  headers,
  rows,
  emptyMessage = "No records found.",
}: {
  headers: string[];
  rows: TableRowData[];
  emptyMessage?: string;
}) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
              className={row.href ? "cursor-pointer" : undefined}
              tabIndex={row.href ? 0 : undefined}
              onClick={row.href ? () => router.push(row.href!) : undefined}
              onKeyDown={
                row.href
                  ? (event) => {
                      if (event.key === "Enter") router.push(row.href!);
                    }
                  : undefined
              }
            >
              {row.cells.map((cell, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
