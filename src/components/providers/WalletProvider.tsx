'use client';

import React, { useMemo } from 'react';
import { NetworkId, WalletId, WalletProvider, WalletManager } from '@txnlab/use-wallet-react';

interface WalletProviderProps {
  children: React.ReactNode;
}

export const AlgorandWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const walletManager = useMemo(() => new WalletManager({
    wallets: [
      WalletId.PERA,
      WalletId.DEFLY,
      WalletId.DEFLY_WEB,
      WalletId.LUTE,
      WalletId.EXODUS,
      WalletId.KIBISIS,
      {
        id: WalletId.MAGIC,
        options: { apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY || '' }
      },
      {
        id: WalletId.WEB3AUTH,
        options: { clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '' }
      },
    ],
    defaultNetwork: (process.env.NEXT_PUBLIC_ALGORAND_NETWORK as NetworkId) || NetworkId.MAINNET,
  }), []);

  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
};
