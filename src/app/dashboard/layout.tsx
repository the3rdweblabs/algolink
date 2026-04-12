import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Your Linked Wallet',
  description: 'View and manage your linked Algorand wallet on AlgoLink.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
