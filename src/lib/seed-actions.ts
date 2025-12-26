'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import { orders as seedOrders, users as seedUsers } from './data';
import { subDays, parseISO } from 'date-fns';

export async function seedDatabase() {
  try {
    const db = await getFirestore();
    
    const [ordersSnapshot, usersSnapshot] = await Promise.all([
      db.collection('orders').limit(1).get(),
      db.collection('users').limit(1).get(),
    ]);

    if (!ordersSnapshot.empty || !usersSnapshot.empty) {
      console.log('Database already contains data. Skipping seed.');
      return { 
        success: false, 
        message: 'Database already contains data. Please clear it first.' 
      };
    }

    console.log('Seeding database...');
    const batch = db.batch();

    const usersCollection = db.collection('users');
    const userRefs: { [key: string]: FirebaseFirestore.DocumentReference } = {};
    seedUsers.forEach(user => {
      const docRef = usersCollection.doc();
      userRefs[user.email] = docRef;
      batch.set(docRef, {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    const ordersCollection = db.collection('orders');
    seedOrders.forEach((order, index) => {
      const docRef = ordersCollection.doc();
      const orderDate = subDays(new Date(), index * 7); // Spread orders over time
      batch.set(docRef, {
        ...order,
        orderDate: Timestamp.fromDate(orderDate),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
    
    const message = `Successfully seeded database with ${seedUsers.length} users and ${seedOrders.length} orders!`;
    console.log(message);
    return { success: true, message };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    const message = `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return { success: false, message };
  }
}
