import type { Metadata } from 'next';

type Props = {
  params: Promise<{ assetId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { assetId } = await params;
  return {
    title: `Asset ${assetId}`,
    description: `View parameters, supply, and holdings for Algorand asset ${assetId}.`,
  };
}

export default function AssetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
