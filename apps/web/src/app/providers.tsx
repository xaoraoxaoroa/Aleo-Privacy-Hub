'use client';

import React, { FC, useMemo, ReactNode } from 'react';
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';
import { Header } from '@/components/layout/Header';

// Import the wallet adapter styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

interface ClientProvidersProps {
  children: ReactNode;
}

export const ClientProviders: FC<ClientProvidersProps> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'Aleo Privacy Hub',
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </WalletModalProvider>
    </WalletProvider>
  );
};
