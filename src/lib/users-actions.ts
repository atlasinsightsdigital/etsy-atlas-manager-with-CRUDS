'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import type { User } from './definitions';
import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export async function updateUser(id: string, data: UserUpdateInput) {
  const db = await getFirestore();
  
  userUpdateSchema.parse(data);

  try {
    await db.doc(`users/${id}`).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    return { id, ...data };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(id: string) {
  const db = await getFirestore();
  
  try {
    await db.doc(`users/${id}`).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getFirestore();
  
  try {
    const doc = await db.doc(`users/${id}`).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getFirestore();
  
  try {
    const snapshot = await db.collection('users').get();
    const users: User[] = [];
    
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to get users');
  }
}
