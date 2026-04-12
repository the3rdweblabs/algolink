import type { Metadata } from 'next';

type Props = {
  params: Promise<{ round: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { round } = await params;
  return {
    title: `Block ${round}`,
    description: `View transactions and header details for Algorand block round ${round}.`,
  };
}

export default function BlockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
