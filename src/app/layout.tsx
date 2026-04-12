import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

import { AlgorandWalletProvider } from '@/components/providers/WalletProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const roboto_mono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AlgoLink - Algorand Wallet Identity Platform',
    template: '%s | AlgoLink',
  },
  description: 'Securely link your Algorand wallet to your email, explore the blockchain, and manage your digital identity with AlgoLink.',
  icons: {
    icon: '/icon.png?v=2',
    apple: '/icon.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <AlgorandWalletProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
            <ThemeToggle />
          </ThemeProvider>
        </AlgorandWalletProvider>
      </body>
    </html>
  );
}
