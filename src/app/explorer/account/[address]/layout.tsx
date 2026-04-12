import type { Metadata } from 'next';

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Account ${address.substring(0, 8)}...`,
    description: `View balance, assets, and transaction history for Algorand account ${address}.`,
  };
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
