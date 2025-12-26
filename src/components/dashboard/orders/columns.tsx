'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2, Edit, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OrderForm } from './order-form';
import { deleteOrder } from '@/lib/orders-actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


function formatDate(date: any): string {
    if (!date) return '';
    // Handles Firestore Timestamps, ISO strings, and JS Date objects
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(jsDate.getTime())) return ''; // Invalid date
    return format(jsDate, 'dd MMM yyyy');
}

// --- Columns Definition ---

function ActionsCell({ order }: { order: Order }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOrder(order.id);
        toast({ title: 'Success', description: 'Order deleted successfully.' });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: (error as Error).message || 'Could not delete order.' 
        });
      }
    });
  };
  
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                 <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                 </DropdownMenuItem>
              </DialogTrigger>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update the details for order {order.etsyOrderId}.</DialogDescription>
          </DialogHeader>
          <OrderForm order={order} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const statusConfigMap: { [key in Order['status']]: { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode} } = {
  Pending: { variant: 'outline', icon: <Clock className="mr-1 h-3 w-3" /> },
  Shipped: { variant: 'secondary', icon: <Truck className="mr-1 h-3 w-3" /> },
  Delivered: { variant: 'default', icon: <CheckCircle className="mr-1 h-3 w-3" /> },
  Cancelled: { variant: 'destructive', icon: <XCircle className="mr-1 h-3 w-3" /> },
};


export const columns: {
    header: string;
    id: keyof Order | 'profit' | 'actions';
    cell?: (row: Order) => React.ReactNode;
}[] = [
  { id: 'etsyOrderId', header: 'Order ID' },
  { id: 'orderDate', header: 'Date', cell: ({ orderDate }: Order) => formatDate(orderDate) },
  { id: 'status', header: 'Status', cell: ({status}: Order) => {
        const config = statusConfigMap[status] || {variant: 'outline', icon: null};
        return <Badge variant={config.variant} className="items-center">{config.icon}{status}</Badge>;
    }},
  { id: 'trackingNumber', header: 'Tracking'},
  { id: 'orderPrice', header: 'Total', cell: ({orderPrice}: Order) => orderPrice.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })},
  { id: 'profit', header: 'Profit', cell: ({orderPrice, orderCost, shippingCost, additionalFees}: Order) => {
      const profit = orderPrice - (orderCost + shippingCost + additionalFees);
      return <span className={profit > 0 ? 'text-green-600' : 'text-destructive'}>{profit.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span>;
    }},
  { id: 'actions', header: 'Actions', cell: (order: Order) => <ActionsCell order={order} /> },
];