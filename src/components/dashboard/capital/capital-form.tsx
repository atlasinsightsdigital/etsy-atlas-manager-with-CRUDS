'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useState } from 'react';
import { createCapitalEntry } from '@/lib/capital-actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  type: z.enum(['Deposit', 'Withdrawal']),
  source: z.enum(['Etsy Payout', 'Loan', 'Dividend', 'Investment']),
  amount: z.coerce
    .number()
    .positive('Amount must be a positive number.')
    .max(10000000, 'Amount too large'),
  transactionDate: z.string().min(1, 'Transaction date is required.'),
  submittedBy: z.string().min(1, 'Submitter is required.'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type CapitalFormProps = {
  setOpen: (open: boolean) => void;
};

export function CapitalEntryForm({ setOpen }: CapitalFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const currentUserEmail = 'admin@etsyatlas.com';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'Deposit',
      source: 'Etsy Payout',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      submittedBy: currentUserEmail,
      notes: '',
    },
  });

  const selectedType = form.watch('type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormError(null);
    
    // Business logic validation
    if (values.type === 'Withdrawal' && values.amount > 50000) {
      setFormError('Withdrawals over 50,000 MAD require additional approval.');
      return;
    }

    startTransition(async () => {
      try {
        await createCapitalEntry(values);
        toast({ 
          title: 'Success', 
          description: 'Capital entry added successfully.',
          duration: 3000,
        });
        setOpen(false);
      } catch (error: any) {
        console.error('Form submission error:', error);
        
        let errorMessage = error.message || 'Something went wrong.';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'You do not have permission to add capital entries.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        setFormError(errorMessage);
        
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
          duration: 5000,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form-level error */}
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entry type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedType === 'Deposit' ? (
                      <>
                        <SelectItem value="Etsy Payout">Etsy Payout</SelectItem>
                        <SelectItem value="Loan">Loan</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Dividend">Dividend</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Loan Repayment">Loan Repayment</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (MAD) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add an optional note..." 
                  className="resize-none" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <span className="text-xs text-muted-foreground">
                  {field.value?.length || 0}/500 characters
                </span>
              </div>
            </FormItem>
          )}
        />
        
        {/* Hidden submittedBy field */}
        <FormField
          control={form.control}
          name="submittedBy"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormLabel>Submitted By</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Entry
          </Button>
        </div>
      </form>
    </Form>
  );
}