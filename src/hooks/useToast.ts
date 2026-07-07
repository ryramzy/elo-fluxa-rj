import { useState, useEffect, useCallback } from 'react';
import { Toast } from '../components/Toast';

// Shared list of toast state setters for global state synchronization
let listeners: Array<(toasts: Toast[]) => void> = [];
let memoryToasts: Toast[] = [];

interface UseToastReturn {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    // Sync initial state
    setToasts(memoryToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };
    
    memoryToasts = [...memoryToasts, newToast];
    listeners.forEach(l => l(memoryToasts));
  }, []);

  const removeToast = useCallback((id: string) => {
    memoryToasts = memoryToasts.filter(t => t.id !== id);
    listeners.forEach(l => l(memoryToasts));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
};

export const addGlobalToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const id = Math.random().toString(36).substring(2, 11);
  const newToast: Toast = { message, type, id };
  
  memoryToasts = [...memoryToasts, newToast];
  listeners.forEach(l => l(memoryToasts));
};

export default useToast;
