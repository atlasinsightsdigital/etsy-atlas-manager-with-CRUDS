'use client';

import { Overview } from '@/components/dashboard/overview';
import { useCollection } from '@/firebase/firestore/use-collection'; // Import directly
import { useFirestore } from '@/firebase/provider'; // This should work now
import type { Order } from '@/lib/definitions';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';

export default function DashboardPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemo(() =>
    firestore ? query(collection(firestore, 'orders')) : null,
    [firestore]
  );

  const { data: allOrders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your Etsy store&apos;s performance.</p>
      </div>
      <Overview orders={allOrders || []} isLoading={isLoading} />
    </div>
  );
}
