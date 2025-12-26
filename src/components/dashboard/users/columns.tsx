'use client';
import * as React from 'react';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
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
import type { User } from '@/lib/definitions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from './user-form';
import { deleteUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

function formatDate(date: any): string {
  if (!date) return '';
  const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
  if (isNaN(jsDate.getTime())) return '';
  return format(jsDate, 'dd MMM yyyy');
}

// MOVE roleVariantMap OUTSIDE the component so it's accessible in the columns array
const roleVariantMap: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  admin: 'destructive',
  user: 'secondary',
};

function ActionsCell({ user }: { user: User }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(user.id);
        toast({ title: 'Success', description: 'User deleted successfully.' });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: (error as Error).message || 'Could not delete user.' 
        });
      }
    });
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
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
                This action cannot be undone. This will permanently delete this user account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>
          <UserForm user={user} setOpen={setIsEditDialogOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: {
  header: string;
  id: keyof User | 'actions';
  cell?: (row: User) => React.ReactNode;
}[] = [
  { id: 'name', header: 'Display Name' },
  { id: 'email', header: 'Email' },
  { 
    id: 'role', 
    header: 'Role', 
    cell: ({ role }: User) => (
      <Badge variant={roleVariantMap[role] || 'outline'} className="capitalize">
        {role}
      </Badge>
    )
  },
  { 
    id: 'createdAt', 
    header: 'Created At', 
    cell: ({ createdAt }: User) => formatDate(createdAt) 
  },
  { 
    id: 'actions', 
    header: 'Actions', 
    cell: (user: User) => <ActionsCell user={user} /> 
  },
];