'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { DataTable } from '@/components/dashboard/capital/data-table';
import { columns } from '@/components/dashboard/capital/columns';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CapitalEntryForm } from '@/components/dashboard/capital/capital-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCapitalSummary } from '@/lib/actions';
import { useEffect } from 'react';
import type { CapitalEntry } from '@/lib/definitions';

export default function CapitalPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netCapital: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await getCapitalSummary();
        setSummary(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error loading summary',
          description: (error as Error).message,
        });
      } finally {
        setIsLoadingSummary(false);
      }
    };
    
    fetchSummary();
  }, [toast]);

  const capitalQuery = useMemo(() => {
    const capitalCollection = collection(firestore, 'capital');
    let q = query(capitalCollection, orderBy('createdAt', 'desc'));
    
    if (typeFilter !== 'all') {
      q = query(q, where('type', '==', typeFilter));
    }
    
    return q;
  }, [firestore, typeFilter]);

  const { data: entries, isLoading, error } = useCollection<CapitalEntry>(capitalQuery);

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error loading capital entries',
      description: error.message,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Capital Management</h2>
          <p className="text-muted-foreground">
            Track your business capital inflows and outflows.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Deposit">Deposits</SelectItem>
              <SelectItem value="Withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Capital Entry</DialogTitle>
                <DialogDescription>
                  Record a new capital deposit or withdrawal.
                </DialogDescription>
              </DialogHeader>
              <CapitalEntryForm setOpen={setIsAddDialogOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                summary.totalDeposits.toLocaleString('fr-MA', {
                  style: 'currency',
                  currency: 'MAD',
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total capital injected into business
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                summary.totalWithdrawals.toLocaleString('fr-MA', {
                  style: 'currency',
                  currency: 'MAD',
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total capital withdrawn from business
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Capital</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoadingSummary ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                summary.netCapital.toLocaleString('fr-MA', {
                  style: 'currency',
                  currency: 'MAD',
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Current available capital
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading capital entries...</span>
          </div>
        ) : entries && entries.length > 0 ? (
          <DataTable columns={columns} data={entries} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {typeFilter !== 'all' 
              ? `No ${typeFilter.toLowerCase()} entries found.`
              : 'No capital entries found. Add your first entry!'}
          </div>
        )}
      </div>
    </div>
  );
}
