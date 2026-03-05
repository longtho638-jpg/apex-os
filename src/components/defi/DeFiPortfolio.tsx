'use client';

import { ArrowUpRight, Loader2, Wallet } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { WalletConnectButton } from './WalletConnectButton';

export default function DeFiPortfolio() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance, isLoading: isLoadingEth } = useBalance({
    address,
  });

  // Mocking other token balances for now as we need contract addresses for real ERC20s
  // In a real app, we would use useReadContract for ERC20 balanceOf
  const mockTokens = [
    { symbol: 'USDT', balance: '1,250.00', value: 1250.0 },
    { symbol: 'USDC', balance: '500.00', value: 500.0 },
    { symbol: 'LINK', balance: '45.50', value: 682.5 },
  ];

  const ethFormatted = ethBalance ? formatEther(ethBalance.value) : '0';
  const totalValue = Number(ethFormatted) * 3000 + mockTokens.reduce((acc, t) => acc + t.value, 0);

  if (!isConnected) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Wallet className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Connect Web3 Wallet</h3>
          <p className="text-gray-400 max-w-xs mx-auto mt-2">
            Connect your wallet to view on-chain assets and execute DeFi swaps directly from Apex OS.
          </p>
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" />
            DeFi Portfolio
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <WalletConnectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total On-Chain Value</div>
          <div className="text-2xl font-bold text-white font-mono">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>+2.4% (24h)</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Native Asset (ETH)</div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white font-mono">
              {isLoadingEth ? <Loader2 className="h-5 w-5 animate-spin" /> : Number(ethFormatted).toFixed(4)} ETH
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">≈ ${(Number(ethFormatted) * 3000).toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">Token Assets</h4>
        {mockTokens.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                {token.symbol[0]}
              </div>
              <div>
                <div className="font-medium text-white">{token.symbol}</div>
                <div className="text-xs text-gray-500">ERC-20 Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-white">{token.balance}</div>
              <div className="text-xs text-gray-500">${token.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
