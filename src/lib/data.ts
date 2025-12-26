import type { User, Order, CapitalEntry } from './definitions';

export const users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Admin User',
    email: 'admin@etsyatlas.com',
    role: 'admin',
  },
  {
    name: 'Sophia Williams',
    email: 'sophia.w@example.com',
    role: 'user',
  },
];

export const orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        etsyOrderId: "ORD12345",
        orderDate: "2024-05-15T10:30:00Z",
        status: "Delivered",
        orderPrice: 120.50,
        orderCost: 45.00,
        shippingCost: 12.50,
        additionalFees: 3.00,
        trackingNumber: "1Z999AA10123456789",
        notes: "Customer requested gift wrapping."
    },
    {
        etsyOrderId: "ORD54321",
        orderDate: "2024-05-18T14:00:00Z",
        status: "Shipped",
        orderPrice: 75.00,
        orderCost: 25.00,
        shippingCost: 10.00,
        additionalFees: 1.50,
        trackingNumber: "1Z999AA10198765432"
    },
    {
        etsyOrderId: "ORD67890",
        orderDate: "2024-05-20T09:00:00Z",
        status: "Pending",
        orderPrice: 250.00,
        orderCost: 110.00,
        shippingCost: 25.00,
        additionalFees: 10.00,
    },
    {
        etsyOrderId: "ORD09876",
        orderDate: "2024-05-12T11:45:00Z",
        status: "Cancelled",
        orderPrice: 50.00,
        orderCost: 20.00,
        shippingCost: 8.00,
        additionalFees: 0,
        notes: "Customer cancelled, accidental purchase."
    }
];

export const capitalEntries: Omit<CapitalEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];
