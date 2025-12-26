'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { DataTable } from '@/components/dashboard/orders/data-table';
import { columns } from '@/components/dashboard/orders/columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/dashboard/orders/order-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrdersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const ordersQuery = useMemo(() => {
    const ordersCollection = collection(firestore, 'orders');
    let q = query(ordersCollection, orderBy('orderDate', 'desc'));

    if (statusFilter !== 'all') {
      q = query(q, where('status', '==', statusFilter));
    }
    
    return q;
  }, [firestore, statusFilter]);

  const { data: orders, isLoading, error } = useCollection(ordersQuery);

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error loading orders',
      description: error.message,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage your Etsy orders and track fulfillment.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
                <DialogDescription>
                  Create a new order from Etsy or manual entry.
                </DialogDescription>
              </DialogHeader>
              <OrderForm setOpen={setIsAddDialogOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : orders && orders.length > 0 ? (
          <DataTable columns={columns} data={orders} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {statusFilter !== 'all' 
              ? `No ${statusFilter.toLowerCase()} orders found.`
              : 'No orders found. Create your first order!'}
          </div>
        )}
      </div>
    </div>
  );
}
