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
import type { Order } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { columns } from './columns';

function formatDate(date: any): string {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(jsDate, 'dd MMM yyyy');
}

function calculateProfit(order: Order): number {
    return order.orderPrice - (order.orderCost + order.shippingCost + order.additionalFees);
}

interface DataTableProps {
  data: Order[];
}

export function DataTable({ data }: DataTableProps) {
  const [filter, setFilter] = React.useState('');

  const filteredData = data.filter((item) => {
    const searchableFields: (keyof Order)[] = ['etsyOrderId', 'status', 'trackingNumber'];
    return searchableFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(filter.toLowerCase());
    });
  });

  const renderMobileCard = (row: Order) => {
    const profit = calculateProfit(row);
    
    return (
      <Card key={row.id} className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{row.etsyOrderId}</p>
              <p className="text-sm text-muted-foreground">{formatDate(row.orderDate)}</p>
            </div>
            {columns.find(c => c.id === 'status')?.cell?.(row)}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium">
                {row.orderPrice.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit</p>
              <p className={`font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </p>
            </div>
          </div>
          
          {row.trackingNumber && (
            <p className="text-xs text-muted-foreground pt-2">
              Tracking: {row.trackingNumber}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by order ID, status, tracking..."
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
            <p className="text-center text-muted-foreground py-8">No orders found.</p>
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
                      {column.cell ? column.cell(row) : (row[column.id as keyof Order] as string)}
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
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}