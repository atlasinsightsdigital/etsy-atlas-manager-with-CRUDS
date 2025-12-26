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
import type { User } from '@/lib/definitions';
import { updateUser } from '@/lib/users-actions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Validation schema
const userFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  role: z.enum(['admin', 'user']),
});

type UserFormProps = {
  user?: User;
  setOpen: (open: boolean) => void;
};

export function UserForm({ user, setOpen }: UserFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || {
      name: '',
      email: '',
      role: 'user',
    },
  });

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    setFormError(null);
    
    if (!user) {
      setFormError('Creating new users is not yet implemented.');
      return;
    }

    // Prevent self-demotion if needed
    if (user.email === 'admin@etsyatlas.com' && values.role !== 'admin') {
      setFormError('Cannot change role of primary admin account.');
      return;
    }

    startTransition(async () => {
      try {
        await updateUser(user.id, values);
        toast({ 
          title: 'Success', 
          description: 'User updated successfully.',
          duration: 3000,
        });
        setOpen(false);
      } catch (error: any) {
        console.error('Form submission error:', error);
        
        let errorMessage = error.message || 'An unexpected error occurred';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'You do not have permission to update users.';
        } else if (error.code === 'not-found') {
          errorMessage = 'User not found.';
        } else if (error.message.includes('already exists')) {
          errorMessage = 'A user with this email already exists.';
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="John Doe"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  {...field} 
                  placeholder="user@example.com"
                  disabled={!!user || isPending}
                  aria-describedby={user ? "email-readonly-description" : undefined}
                />
              </FormControl>
              <FormMessage />
              {user && (
                <p id="email-readonly-description" className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed after account creation
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Administrators have full access to all features
              </p>
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
          <Button type="submit" disabled={isPending || !user}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}