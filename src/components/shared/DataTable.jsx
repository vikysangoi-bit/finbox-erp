import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function DataTable({ 
  columns, 
  data, 
  isLoading, 
  onRowClick,
  emptyMessage = "No data available",
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll
}) {
  const allSelected = selectable && data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectable && selectedRows.length > 0 && selectedRows.length < data.length;

  if (isLoading) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-100">
              {selectable && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
              {columns.map((col, i) => (
                <TableHead key={i} className="text-slate-600 font-semibold">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {selectable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-100">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                    className={someSelected ? "data-[state=checked]:bg-slate-400" : ""}
                  />
                </TableHead>
              )}
              {columns.map((col, i) => (
                <TableHead key={i} className={`text-slate-600 font-semibold ${col.className || ''}`}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-12 text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow 
                  key={row.id || i} 
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.some(selected => selected.id === row.id)}
                        onCheckedChange={() => onSelectRow(row)}
                        aria-label={`Select row ${i + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col, j) => (
                    <TableCell key={j} className={col.cellClassName || ''} onClick={() => onRowClick?.(row)}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}