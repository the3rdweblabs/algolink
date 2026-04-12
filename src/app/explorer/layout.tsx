import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Explorer - Search Algorand Blockchain',
  description: 'Explore Algorand accounts, transactions, assets, applications, and blocks with AlgoLink Smart Explorer.',
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
