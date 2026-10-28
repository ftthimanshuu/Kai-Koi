import { type ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const initAuth = useAuthStore((state) => state.initAuth);

  // Initialize Auth state listener and Axios token provider
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      unsubscribe();
    };
  }, [initAuth]);

  // Synchronize document root with initial theme state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
