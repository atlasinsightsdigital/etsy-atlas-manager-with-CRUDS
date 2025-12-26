import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Order, CapitalEntry, User } from '@/lib/definitions';

const { firestore } = initializeFirebase();

// Helper to convert Firestore Timestamp to Date string
export const toDateString = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString().split('T')[0];
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString().split('T')[0];
  }
  return timestamp;
};

// Generic CRUD operations
export const firestoreCRUD = {
  // Create a document
  create: async <T extends DocumentData>(collectionPath: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(firestore, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw new Error(`Failed to create ${collectionPath.slice(0, -1)}`);
    }
  },

  // Update a document
  update: async <T extends DocumentData>(collectionPath: string, id: string, data: Partial<T>) => {
    try {
      const docRef = doc(firestore, collectionPath, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document in ${collectionPath}:`, error);
      throw new Error(`Failed to update ${collectionPath.slice(0, -1)}`);
    }
  },

  // Delete a document
  delete: async (collectionPath: string, id: string) => {
    try {
      const docRef = doc(firestore, collectionPath, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionPath}:`, error);
      throw new Error(`Failed to delete ${collectionPath.slice(0, -1)}`);
    }
  },

  // Get a document by ID
  getById: async <T>(collectionPath: string, id: string): Promise<T | null> => {
    try {
      const docRef = doc(firestore, collectionPath, id);
      // Note: This returns the reference, you'd use onSnapshot in components
      return docRef as any;
    } catch (error) {
      console.error(`Error getting document from ${collectionPath}:`, error);
      throw new Error(`Failed to get ${collectionPath.slice(0, -1)}`);
    }
  },
};

// Order-specific operations
export const orderOperations = {
  // Query orders with filters
  queryOrders: (filters?: {
    status?: Order['status'];
    startDate?: string;
    endDate?: string;
  }) => {
    let q = query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.startDate) {
      q = query(q, where('orderDate', '>=', Timestamp.fromDate(new Date(filters.startDate))));
    }
    if (filters?.endDate) {
      q = query(q, where('orderDate', '<=', Timestamp.fromDate(new Date(filters.endDate))));
    }
    
    return q;
  },

  // Get order statistics
  getOrderStats: async () => {
    try {
      const ordersQuery = query(collection(firestore, 'orders'));
      // You would implement aggregation here or use onSnapshot
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw new Error('Failed to get order statistics');
    }
  },
};

// Capital-specific operations
export const capitalOperations = {
  queryCapitalEntries: (type?: CapitalEntry['type']) => {
    let q = query(collection(firestore, 'capital'), orderBy('createdAt', 'desc'));
    
    if (type) {
      q = query(q, where('type', '==', type));
    }
    
    return q;
  },

  getCapitalSummary: async () => {
    try {
      const capitalQuery = query(collection(firestore, 'capital'));
      // You would implement aggregation here
      return {
        totalDeposits: 0,
        totalWithdrawals: 0,
        netCapital: 0,
      };
    } catch (error) {
      console.error('Error getting capital summary:', error);
      throw new Error('Failed to get capital summary');
    }
  },
};

// User-specific operations
export const userOperations = {
  queryUsers: (role?: User['role']) => {
    let q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
    
    if (role) {
      q = query(q, where('role', '==', role));
    }
    
    return q;
  },

  updateUserRole: async (userId: string, role: User['role']) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  },
};

export default firestoreCRUD;