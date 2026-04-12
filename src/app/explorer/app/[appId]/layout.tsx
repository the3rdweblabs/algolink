import type { Metadata } from 'next';

type Props = {
  params: Promise<{ appId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appId } = await params;
  return {
    title: `Application ${appId}`,
    description: `View state, programs, and usage for Algorand smart contract ${appId}.`,
  };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
