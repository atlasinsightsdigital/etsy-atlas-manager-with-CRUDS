'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '@/firebase/server-init';
import type { CapitalEntry } from './definitions';
import { z } from 'zod';

export const capitalEntrySchema = z.object({
  type: z.enum(['Deposit', 'Withdrawal']),
  source: z.enum(['Etsy Payout', 'Loan', 'Dividend', 'Investment', 'Loan Repayment']),
  amount: z.coerce.number().positive('Amount must be positive'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  submittedBy: z.string().min(1, 'Submitter is required'),
  notes: z.string().optional(),
});

export type CapitalEntryInput = z.infer<typeof capitalEntrySchema>;

export async function createCapitalEntry(data: CapitalEntryInput) {
  const db = await getFirestore();
  
  capitalEntrySchema.parse(data);
  
  const entryData = {
    ...data,
    transactionDate: Timestamp.fromDate(new Date(data.transactionDate)),
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('capital').add(entryData);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating capital entry:', error);
    throw new Error('Failed to create capital entry');
  }
}

export async function updateCapitalEntry(id: string, data: Partial<CapitalEntryInput>) {
  const db = await getFirestore();
  
  if (Object.keys(data).length > 0) {
    capitalEntrySchema.partial().parse(data);
  }

  const updateData: any = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.transactionDate) {
    updateData.transactionDate = Timestamp.fromDate(new Date(data.transactionDate));
  }

  try {
    await db.doc(`capital/${id}`).update(updateData);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating capital entry:', error);
    throw new Error('Failed to update capital entry');
  }
}

export async function deleteCapitalEntry(id: string) {
  const db = await getFirestore();
  
  try {
    await db.doc(`capital/${id}`).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting capital entry:', error);
    throw new Error('Failed to delete capital entry');
  }
}

export async function getCapitalSummary() {
  const db = await getFirestore();
  
  try {
    const snapshot = await db.collection('capital').get();
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'Deposit') {
        totalDeposits += data.amount;
      } else {
        totalWithdrawals += data.amount;
      }
    });
    
    return {
      totalDeposits,
      totalWithdrawals,
      netCapital: totalDeposits - totalWithdrawals,
    };
  } catch (error) {
    console.error('Error getting capital summary:', error);
    throw new Error('Failed to get capital summary');
  }
}
