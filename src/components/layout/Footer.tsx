// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border py-6 text-center"> {/* Removed bg-card for transparency */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} <span className="font-semibold text-primary">AlgoLink</span> - <Link href="/docs" className="text-primary hover:underline">Documentation</Link>. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Securely bridging wallets and identities on Algorand.
        </p>
      </div>
    </footer>
  );
}
