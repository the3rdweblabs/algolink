// src/app/docs/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlgoLink Docs - Identity, AI Security & Developer API',
  description: 'Comprehensive documentation for AlgoLink: 1:1 wallet linking, AI-powered address poisoning protection, and developer API reference.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
