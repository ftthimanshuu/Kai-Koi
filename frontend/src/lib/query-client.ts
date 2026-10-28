import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes before refetching in background
      gcTime: 1000 * 60 * 10, // 10 minutes cache retention
      retry: 1, // Retry failed queries once before showing error
      refetchOnWindowFocus: false, // Avoid excessive refetches when switching browser tabs
    },
    mutations: {
      retry: 0,
    },
  },
});
