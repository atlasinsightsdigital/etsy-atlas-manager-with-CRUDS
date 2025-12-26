'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { CapitalEntry } from '@/lib/definitions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteCapitalEntry } from '@/lib/actions';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

function formatDate(date: any): string {
    if (!date) return '';
    // Handles Firestore Timestamps, ISO strings, and JS Date objects
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(jsDate.getTime())) return ''; // Invalid date
    return format(jsDate, 'dd MMM yyyy');
}

function ActionsCell({ entry }: { entry: CapitalEntry }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCapitalEntry(entry.id);
        toast({ title: 'Success', description: 'Capital entry deleted successfully.' });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: (error as Error).message || 'Could not delete entry.' 
        });
      }
    });
  };
  
  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this capital entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const typeConfigMap: { [key in CapitalEntry['type']]: { variant: "default" | "destructive", icon: React.ReactNode } } = {
  Deposit: { variant: 'default', icon: <ArrowUp className="mr-1 h-3 w-3" /> },
  Withdrawal: { variant: 'destructive', icon: <ArrowDown className="mr-1 h-3 w-3" /> },
};


export const  columns: {
    header: string;
    id: keyof CapitalEntry | 'actions';
    cell?: (row: CapitalEntry) => React.ReactNode;
}[] = [
  { id: 'createdAt', header: 'Entry Date', cell: ({ createdAt }: CapitalEntry) => formatDate(createdAt)},
  { id: 'transactionDate', header: 'Transaction Date', cell: ({ transactionDate }: CapitalEntry) => formatDate(transactionDate) },
  { id: 'type', header: 'Type', cell: ({ type }: CapitalEntry) => {
        const config = typeConfigMap[type];
        if (!config) return <Badge variant="outline">{type}</Badge>;
        return <Badge variant={config.variant} className="capitalize items-center">{config.icon}{type}</Badge>;
    }},
  { id: 'amount', header: 'Amount', cell: ({ amount, type }: CapitalEntry) => (
      <span className={type === 'Withdrawal' ? 'text-destructive' : 'text-green-600'}>
          {type === 'Withdrawal' ? '-' : '+'}
          {amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
      </span>
  )},
  { id: 'source', header: 'Source' },
  { id: 'submittedBy', header: 'Submitted By' },
  { id: 'actions', header: 'Actions', cell: (entry: CapitalEntry) => <ActionsCell entry={entry} />},
];
