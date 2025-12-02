'use client';

import { WagmiProvider as Provider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: ReactNode }) {
    return (
        <Provider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    );
}
