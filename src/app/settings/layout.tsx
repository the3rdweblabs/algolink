import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallet Settings - Privacy & Management',
  description: 'Manage your linked Algorand wallet privacy and settings on AlgoLink.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
