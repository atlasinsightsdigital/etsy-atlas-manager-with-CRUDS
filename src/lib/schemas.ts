import { z } from 'zod';

// Order schemas
export const orderSchema = z.object({
  etsyOrderId: z.string().min(1, 'Etsy Order ID is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
  orderPrice: z.coerce.number().positive('Must be positive'),
  orderCost: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  additionalFees: z.coerce.number().min(0),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export const orderUpdateSchema = orderSchema.partial();

// Capital entry schemas
export const capitalEntrySchema = z.object({
  type: z.enum(['Deposit', 'Withdrawal']),
  source: z.enum(['Etsy Payout', 'Loan', 'Dividend', 'Investment']),
  amount: z.coerce.number().positive('Amount must be positive'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  submittedBy: z.string().min(1, 'Submitter is required'),
  notes: z.string().optional(),
});

export const capitalEntryUpdateSchema = capitalEntrySchema.partial();

// User schemas
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']),
});

export const userUpdateSchema = userSchema.partial();

// Export types
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type CapitalEntryInput = z.infer<typeof capitalEntrySchema>;
export type CapitalEntryUpdateInput = z.infer<typeof capitalEntryUpdateSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
