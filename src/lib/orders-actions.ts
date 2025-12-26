'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import type { Order } from './definitions';
import { z } from 'zod';

const orderSchema = z.object({
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

type OrderInput = z.infer<typeof orderSchema>;

export async function createOrder(data: OrderInput) {
  const db = await getFirestore();
  
  orderSchema.parse(data);
  
  const orderData = {
    ...data,
    orderDate: Timestamp.fromDate(new Date(data.orderDate)),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('orders').add(orderData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function updateOrder(id: string, data: Partial<OrderInput>) {
  const db = await getFirestore();
  
  if (Object.keys(data).length > 0) {
    orderSchema.partial().parse(data);
  }

  const updateData: any = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.orderDate) {
    updateData.orderDate = Timestamp.fromDate(new Date(data.orderDate));
  }

  try {
    await db.doc(`orders/${id}`).update(updateData);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

export async function deleteOrder(id: string) {
  const db = await getFirestore();
  
  try {
    await db.doc(`orders/${id}`).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = await getFirestore();
  
  try {
    const doc = await db.doc(`orders/${id}`).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as Order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
}
