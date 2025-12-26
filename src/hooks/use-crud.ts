'use client';

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseCRUDOptions<T> {
  onCreate?: (data: T) => Promise<void>;
  onUpdate?: (id: string, data: Partial<T>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export function useCRUD<T extends { id: string }>(options: UseCRUDOptions<T> = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const create = useCallback(async (data: Omit<T, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (options.onCreate) {
        await options.onCreate(data as T);
      }
      
      if (options.onSuccess) {
        options.onSuccess('Item created successfully');
      } else {
        toast({ title: 'Success', description: 'Item created successfully.' });
      }
      
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to create item',
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (options.onUpdate) {
        await options.onUpdate(id, data);
      }
      
      if (options.onSuccess) {
        options.onSuccess('Item updated successfully');
      } else {
        toast({ title: 'Success', description: 'Item updated successfully.' });
      }
      
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to update item',
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (options.onDelete) {
        await options.onDelete(id);
      }
      
      if (options.onSuccess) {
        options.onSuccess('Item deleted successfully');
      } else {
        toast({ title: 'Success', description: 'Item deleted successfully.' });
      }
      
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to delete item',
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  return {
    create,
    update,
    remove,
    isLoading,
    error,
    setError,
  };
}