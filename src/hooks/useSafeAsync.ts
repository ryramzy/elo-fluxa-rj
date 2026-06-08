import { useState, useCallback } from 'react';
import { useToast } from './useToast';

export function useSafeAsync<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const run = useCallback(async (
    promise: Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await promise;
      
      if (options?.successMessage) {
        showToast({ message: options.successMessage, type: 'success' });
      }
      
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
      
      return data;
    } catch (err: any) {
      console.error('[useSafeAsync Error]:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      const message = options?.errorMessage || err.message || 'Um erro ocorreu. Tente novamente.';
      showToast({ message, type: 'error' });
      
      if (options?.onError) {
        options.onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { run, loading, error };
}
