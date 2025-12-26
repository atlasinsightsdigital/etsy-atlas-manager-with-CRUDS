'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useState } from 'react';
import type { Order } from '@/lib/definitions';
import { createOrder, updateOrder } from '@/lib/orders-actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Zod Schema
const formSchema = z.object({
  etsyOrderId: z.string().min(1, 'Etsy Order ID is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
  orderPrice: z.coerce
    .number()
    .positive('Must be positive')
    .max(1000000, 'Price too high'),
  orderCost: z.coerce
    .number()
    .min(0, 'Cost cannot be negative')
    .max(1000000, 'Cost too high'),
  shippingCost: z.coerce
    .number()
    .min(0, 'Shipping cost cannot be negative')
    .max(10000, 'Shipping cost too high'),
  additionalFees: z.coerce
    .number()
    .min(0, 'Additional fees cannot be negative')
    .max(10000, 'Additional fees too high'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  trackingNumber: z.string().max(100, 'Tracking number too long').optional(),
});

type OrderFormProps = {
  order?: Order;
  setOpen: (open: boolean) => void;
};

// Helper to convert Firestore Timestamp or string to 'yyyy-MM-dd' format
function formatDateForInput(date: any): string {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(jsDate.getTime())) return '';
    
    const timezoneOffset = jsDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(jsDate.getTime() - timezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
}

export function OrderForm({ order, setOpen }: OrderFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: order
      ? {
          ...order,
          orderDate: formatDateForInput(order.orderDate),
          notes: order.notes || '',
          trackingNumber: order.trackingNumber || '',
        }
      : {
          etsyOrderId: '',
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          orderPrice: 0,
          orderCost: 0,
          shippingCost: 0,
          additionalFees: 0,
          notes: '',
          trackingNumber: '',
        },
  });

  // Calculate profit for display
  const watchOrderPrice = form.watch('orderPrice');
  const watchOrderCost = form.watch('orderCost');
  const watchShippingCost = form.watch('shippingCost');
  const watchAdditionalFees = form.watch('additionalFees');
  
  const profit = watchOrderPrice - (watchOrderCost + watchShippingCost + watchAdditionalFees);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormError(null);
    
    // Validate profit is not too negative (business logic)
    const calculatedProfit = values.orderPrice - (values.orderCost + values.shippingCost + values.additionalFees);
    if (calculatedProfit < -1000) {
      setFormError('Profit seems too negative. Please check your costs.');
      return;
    }

    startTransition(async () => {
      try {
        if (order) {
          await updateOrder(order.id, values);
          toast({ 
            title: 'Success', 
            description: 'Order updated successfully.',
            duration: 3000,
          });
        } else {
          await createOrder(values);
          toast({ 
            title: 'Success', 
            description: 'Order created successfully.',
            duration: 3000,
          });
        }
        setOpen(false);
      } catch (error: any) {
        console.error('Form submission error:', error);
        
        // Handle specific error cases
        let errorMessage = error.message || 'An unexpected error occurred';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('unique constraint')) {
          errorMessage = 'An order with this Etsy ID already exists.';
        }
        
        setFormError(errorMessage);
        
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
          duration: 5000,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form-level error */}
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Profit Preview */}
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Estimated Profit:</span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Profit = Total - (Cost + Shipping + Fees)
          </p>
        </div>

        {/* FIRST SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="etsyOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etsy Order ID *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={!!order}
                    placeholder="1234567890"
                    aria-describedby="etsy-order-id-description"
                  />
                </FormControl>
                <FormMessage />
                <p id="etsy-order-id-description" className="text-xs text-muted-foreground mt-1">
                  {order ? 'Cannot change Etsy Order ID after creation' : 'Unique identifier from Etsy'}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Optional tracking number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    disabled={!!order}
                    aria-describedby="order-date-description"
                  />
                </FormControl>
                <FormMessage />
                <p id="order-date-description" className="text-xs text-muted-foreground mt-1">
                  {order ? 'Date cannot be changed after creation' : 'Date order was placed'}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PRICES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="orderPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price (MAD) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    disabled={!!order}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="orderCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Cost (MAD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="shippingCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Cost (MAD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="additionalFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Fees (MAD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* NOTES */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="resize-none" 
                  placeholder="Optional notes about this order..."
                  rows={3}
                />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <span className="text-xs text-muted-foreground">
                  {field.value?.length || 0}/500 characters
                </span>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? 'Update Order' : 'Create Order'}
          </Button>
        </div>

      </form>
    </Form>
  );
}