import { FieldValue, Timestamp } from "firebase/firestore";

// Helper type to represent a Firestore Timestamp or a string for serialization
type FirestoreDate = string | Timestamp | FieldValue;

export type User = {
  id: string; 
  name: string; 
  email: string;
  role: 'admin' | 'user';
  createdAt: FirestoreDate;
  updatedAt?: FirestoreDate;
};

export type Order = {
  id: string;
  etsyOrderId: string;
  orderDate: FirestoreDate;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderPrice: number;
  orderCost: number;
  shippingCost: number;
  additionalFees: number;
  notes?: string;
  trackingNumber?: string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
};

export type CapitalEntry = {
  id: string;
  createdAt: FirestoreDate;
  transactionDate: FirestoreDate;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  source: 'Etsy Payout' | 'Loan' | 'Dividend' | 'Investment';
  submittedBy: string; 
  notes?: string;
  updatedAt?: FirestoreDate;
};

// Utility types for forms
export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrderInput = Partial<CreateOrderInput>;

export type CreateCapitalEntryInput = Omit<CapitalEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCapitalEntryInput = Partial<CreateCapitalEntryInput>;

export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;