'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Button 
        onClick={() => disconnect()} 
        className="bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-2"
      >
        <Wallet className="w-4 h-4 text-emerald-400" />
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-2"
        >
          Connect Wallet
        </Button>
      ))}
    </div>
  );
}
