import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deriveAddress, getBalance as getAleoBalance } from '@/lib/aleo';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  privateKey: string | null;
  balance: number;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  connect: (privateKey: string) => Promise<void>;
  disconnect: () => void;
  setBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      address: null,
      privateKey: null,
      balance: 0,
      isLoading: false,
      isHydrated: false,

      connect: async (privateKey: string) => {
        set({ isLoading: true });
        try {
          // Validate private key format
          if (!privateKey || !privateKey.startsWith('APrivateKey1')) {
            throw new Error('Invalid private key format. Must start with APrivateKey1');
          }

          // Derive REAL address using Aleo SDK
          const address = await deriveAddress(privateKey);
          console.log('Connected with REAL Aleo address:', address);

          // Get real balance from testnet
          let balance = 0;
          try {
            balance = await getAleoBalance(address);
            console.log('Account balance:', balance, 'ALEO');
          } catch (e) {
            console.log('Could not fetch balance');
          }

          set({
            isConnected: true,
            address,
            privateKey,
            balance,
            isLoading: false,
          });
        } catch (error) {
          console.error('Wallet connection failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          address: null,
          privateKey: null,
          balance: 0,
        });
      },

      setBalance: (balance: number) => {
        set({ balance });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      refreshBalance: async () => {
        const { address } = get();
        if (address) {
          try {
            const balance = await getAleoBalance(address);
            set({ balance });
          } catch (error) {
            console.error('Failed to refresh balance:', error);
          }
        }
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        address: state.address,
        privateKey: state.privateKey,
        isConnected: state.isConnected,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isConnected && !state.privateKey) {
            state.isConnected = false;
            state.address = null;
          }
          state.isHydrated = true;
        }
      },
    }
  )
);
