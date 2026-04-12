
// src/app/dashboard/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import WalletCard from '@/components/dashboard/WalletCard';
import type { WalletLink } from '@/types';
import { InfoIcon, Loader2, LinkIcon as LinkIconLucide, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getWalletsForUser } from '@/app/actions/walletActions';
import { getCurrentUser } from '@/app/actions/authActions';
import ProfileCard from '@/components/dashboard/ProfileCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


// Mock data for AI feature demonstration if no wallets are linked by user.
const mockExampleWalletLinkForAIDemo: WalletLink[] = [
    {
    id: 'DEMO_AI_POISONED',
    userId: 'demo-user', // This userId is not relevant for display, just for type consistency
    email: 'demo-poisoned@example.ai',
    walletAddress: 'B0BSWALLETADDRESSWITHAN0FOROANDEXTRALENGTHSOITLOOKSSIMILAR',
    userExpectedAddress: 'BOBSWALLETADDRESSWITHAN0FOROANDEXTRALENGTH...',
    transactionHistory: 'Received 10 ALGO from ALICEWALLETADDRESS... on 2023-10-15. Sent 2 ALGO to RANDOMSHOPSERVICE... on 2023-10-12. Staked 50 ALGO in FolksFinance 2023-10-01.',
    isPublic: true,
  },
  {
    id: 'DEMO_AI_CLEAR',
    userId: 'demo-user',
    email: 'demo-clear@example.ai',
    walletAddress: 'ALICEWALLETADDRESSJ3V2XQWERTYUIOPASDFGHJKLZXCVBNM123456',
    userExpectedAddress: 'ALICEWALLETADDRESSJ3V2XQWERTYUIOPASDFGHJKLZXCVBNM123456',
    transactionHistory: 'Sent 10 ALGO to B0BSWALLETADDRESS... on 2023-10-15. Received 5 ALGO from CHARLIEWALLET... on 2023-10-10.',
    isPublic: false,
  }
];


export default function DashboardPage() {
  const [linkedWallets, setLinkedWallets] = useState<WalletLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    userId: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();
        setUserData(user);

        if (user) {
          const walletsFromDb = await getWalletsForUser();
          setLinkedWallets(walletsFromDb);
        } else {
          setLinkedWallets([]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLinkedWallets([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <LayoutDashboard className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          My Dashboard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          View and manage your linked Algorand wallet.
        </p>
      </div>

      {userData && (
        <div className="max-w-4xl mx-auto w-full">
            <ProfileCard user={userData} />
        </div>
      )}

      {linkedWallets.length > 0 ? (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <WalletCard key={linkedWallets[0].id} walletLink={linkedWallets[0]} />
          </div>
        </div>
      ) : (
        <Card className="text-center shadow-md">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <InfoIcon className="w-16 h-16 text-primary mb-4" />
            <CardTitle className="text-xl font-semibold text-foreground mb-2">No Wallet Linked Yet</CardTitle>
            <CardDescription className="mb-6">
              You haven&apos;t linked an Algorand wallet to your account yet.
            </CardDescription>
            <Button asChild size="lg">
              <Link href="/linkWallet">
                <LinkIconLucide className="mr-2 h-5 w-5" />
                Link Your Wallet Now
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-8">
              Want to see how the AI-powered suspicious address detection works?
              <br /> Review these examples (these are not your wallets):
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4">
              {mockExampleWalletLinkForAIDemo.slice(0,2).map(demoLink => (
                  <WalletCard key={demoLink.id} walletLink={demoLink} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">(Above are demo cards to showcase AI features)</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
