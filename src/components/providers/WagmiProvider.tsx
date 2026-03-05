'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WagmiProvider as Provider } from 'wagmi';
import { config } from '@/config/wagmi';

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: ReactNode }) {
  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
