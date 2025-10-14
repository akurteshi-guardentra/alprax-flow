import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized React Query client configuration
 * Optimizes caching, stale time, and retry logic for better performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Refetch on mount only if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query keys factory for consistent cache key management
 */
export const queryKeys = {
  stellar: {
    all: ['stellar'] as const,
    accounts: () => [...queryKeys.stellar.all, 'accounts'] as const,
    account: (publicKey: string) => [...queryKeys.stellar.accounts(), publicKey] as const,
    balance: (publicKey: string) => [...queryKeys.stellar.account(publicKey), 'balance'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.transactions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
    history: (publicKey: string) => [...queryKeys.transactions.all, 'history', publicKey] as const,
  },
  recipients: {
    all: ['recipients'] as const,
    favorites: () => [...queryKeys.recipients.all, 'favorites'] as const,
  },
  batch: {
    all: ['batch'] as const,
    transfers: () => [...queryKeys.batch.all, 'transfers'] as const,
  },
  referrals: {
    all: ['referrals'] as const,
    code: () => [...queryKeys.referrals.all, 'code'] as const,
    analytics: () => [...queryKeys.referrals.all, 'analytics'] as const,
  },
  family: {
    all: ['family'] as const,
    groups: () => [...queryKeys.family.all, 'groups'] as const,
  },
} as const;
