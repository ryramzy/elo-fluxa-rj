// Error handling utilities for the Elo! app

export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string = 'APP_ERROR', context?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export class FirebaseError extends AppError {
  constructor(message: string, firebaseCode?: string, context?: Record<string, any>) {
    super(message, firebaseCode || 'FIREBASE_ERROR', context);
    this.name = 'FirebaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Firebase errors
  'permission-denied': 'You don\'t have permission to perform this action',
  'not-found': 'The requested resource was not found',
  'already-exists': 'This item already exists',
  'resource-exhausted': 'Too many requests. Please try again later',
  'unauthenticated': 'Please log in to continue',
  'unavailable': 'Service is temporarily unavailable. Please try again',
  'deadline-exceeded': 'Request timed out. Please try again',
  
  // Network errors
  'NETWORK_ERROR': 'Please check your internet connection and try again',
  'timeout': 'Request timed out. Please check your connection',
  
  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again',
  'INVALID_DATE': 'Please select a valid date',
  'INVALID_TIME': 'Please select a valid time slot',
  
  // App errors
  'SLOT_NOT_AVAILABLE': 'This time slot is no longer available',
  'DOUBLE_BOOKED': 'This slot was just booked by someone else. Please pick another time.',
  'BOOKING_FAILED': 'Failed to book the slot. Please try again',
  'SLOT_CREATION_FAILED': 'Failed to create time slots. Please try again',
  'USER_NOT_FOUND': 'User not found. Please log in again',
};

export function getErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  
  if (error?.code) {
    return ERROR_MESSAGES[error.code] || error.message || 'An unexpected error occurred';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function logError(error: any, context?: Record<string, any>) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    code: error?.code || 'UNKNOWN',
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('App Error:', errorInfo);
  
  // Forward to observability layers if loaded
  if ((window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  }
  if ((window as any).LogRocket) {
    (window as any).LogRocket.captureException(error, { extra: context });
  }
  
  // In production, send to error logging service
  if (import.meta.env.PROD) {
    console.error('Production Error:', errorInfo);
  }
}

export function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return asyncFn().catch((error) => {
    logError(error, { errorMessage });
    throw new AppError(errorMessage || getErrorMessage(error), error.code);
  });
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  errorMessage?: string
) {
  return (...args: T): R => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error, { args, errorMessage });
          throw new AppError(errorMessage || getErrorMessage(error), error.code);
        }) as R;
      }
      
      return result;
    } catch (error) {
      logError(error, { args, errorMessage });
      throw new AppError(errorMessage || getErrorMessage(error), error.code);
    }
  };
}

// Retry utility for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  timeoutMs: number = 8000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new AppError('Operation timed out', 'timeout')), timeoutMs);
      });
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

// Network status checker
export function checkNetworkStatus(): boolean {
  return navigator.onLine;
}

export function addNetworkStatusListener(callback: (online: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}
