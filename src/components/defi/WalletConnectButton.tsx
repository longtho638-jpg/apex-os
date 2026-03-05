'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-mono"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
