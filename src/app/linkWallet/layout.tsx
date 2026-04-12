import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Wallet - Connect Your Algorand Wallet',
  description: 'Securely link your Algorand wallet to your AlgoLink account.',
};

export default function LinkWalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
