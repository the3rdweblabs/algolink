import type { Metadata } from 'next';

type Props = {
  params: Promise<{ txid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { txid } = await params;
  return {
    title: `Transaction ${txid.substring(0, 8)}...`,
    description: `View details for Algorand transaction ${txid}.`,
  };
}

export default function TransactionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
