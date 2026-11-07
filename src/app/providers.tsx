import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastViewport } from '@/components/ToastViewport';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}><BrowserRouter>{children}<ToastViewport /></BrowserRouter></QueryClientProvider>;
}
