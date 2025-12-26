'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { columns } from './columns';

function formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(jsDate, 'dd MMM yyyy');
}

interface DataTableProps {
  data: User[];
}

export function DataTable({ data }: DataTableProps) {
  const [filter, setFilter] = React.useState('');

  const filteredData = data.filter((item) => {
    const searchableFields: (keyof User)[] = ['name', 'email', 'role'];
    return searchableFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(filter.toLowerCase());
    });
  });

  // Helper to get cell value
  const getCellValue = (row: User, columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column?.cell) {
      return column.cell(row);
    }
    return row[columnId as keyof User];
  };

  const renderMobileCard = (row: User) => (
    <Card key={row.id} className="mb-4">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
            <p className="font-bold">{row.name}</p>
            {columns.find(c => c.id === 'role')?.cell?.(row)}
        </div>
        <p className="text-sm text-muted-foreground">{row.email}</p>
        <p className="text-xs text-muted-foreground pt-2">Created: {formatDate(row.createdAt)}</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by name, email, role..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        {filteredData.length > 0 ? (
            filteredData.map(renderMobileCard)
        ) : (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {getCellValue(row, column.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}