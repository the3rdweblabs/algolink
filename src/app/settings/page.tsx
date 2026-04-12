
// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { WalletLink } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Settings2Icon, Trash2Icon, LinkIcon as LinkIconLucide } from 'lucide-react';
import { getWalletsForUser, updateWalletPrivacy, removeWalletLink } from '@/app/actions/walletActions';
import { getCurrentUser } from '@/app/actions/authActions';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [linkedWallets, setLinkedWallets] = useState<WalletLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);


  async function fetchUserWallets() {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setCurrentUserEmail(user?.email ?? null);
      if (user) {
        const walletsFromDb = await getWalletsForUser();
        setLinkedWallets(walletsFromDb);
      } else {
        setLinkedWallets([]);
      }
    } catch (error) {
      console.error("Failed to fetch wallets for settings:", error);
      toast({ title: "Error", description: "Could not load wallet settings.", variant: "destructive" });
      setLinkedWallets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserWallets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrivacyToggle = async (walletId: string, newPublicState: boolean) => {
    const originalWallets = [...linkedWallets];
    const walletToUpdate = originalWallets.find(w => w.id === walletId);
    if (!walletToUpdate) return;
    const originalPublicState = walletToUpdate.isPublic;

    setLinkedWallets(currentSettings =>
      currentSettings.map(setting =>
        setting.id === walletId ? { ...setting, isPublic: newPublicState } : setting
      )
    );

    const result = await updateWalletPrivacy(walletId, newPublicState);
    if (result.success) {
      toast({
        title: 'Setting Updated',
        description: `Public visibility for wallet linked to ${walletToUpdate.email.substring(0,15)}... is now ${newPublicState ? 'ON' : 'OFF'}.`,
        action: <CheckCircle className="text-green-500" />,
      });
    } else {
      setLinkedWallets(currentSettings =>
        currentSettings.map(setting =>
          setting.id === walletId ? { ...setting, isPublic: originalPublicState } : setting
        )
      );
      toast({
        title: 'Update Failed',
        description: result.error || "Could not update privacy setting.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveWallet = async (walletId: string) => {
    const walletToRemove = linkedWallets.find(w => w.id === walletId);
    if (!walletToRemove) return;

    const result = await removeWalletLink(walletId);
    if (result.success) {
      setLinkedWallets(currentWallets => currentWallets.filter(w => w.id !== walletId));
      toast({
        title: 'Wallet Unlinked',
        description: `Wallet linked to ${walletToRemove.email.substring(0,15)}... has been unlinked.`,
        action: <CheckCircle className="text-green-500" />,
      });
    } else {
      toast({
        title: 'Unlinking Failed',
        description: result.error || "Could not unlink wallet.",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="text-center">
        <Settings2Icon className="mx-auto h-12 w-12 text-primary mb-2" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Wallet Settings
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          Manage your linked Algorand wallet and its public email resolvability.
        </p>
        {currentUserEmail && (
            <p className="text-sm text-muted-foreground">(Account: {currentUserEmail})</p>
        )}
      </div>

      {linkedWallets.length > 0 ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Card key={linkedWallets[0].id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-primary truncate">Public Email: {linkedWallets[0].email}</CardTitle>
              <CardDescription className="text-sm truncate">Wallet Address: {linkedWallets[0].walletAddress}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                <Label htmlFor={`privacy-${linkedWallets[0].id}`} className="text-base font-medium flex-1 cursor-pointer">
                  Allow Public Resolution
                   <p className="text-xs text-muted-foreground mt-1 pr-4">
                    If enabled, others can find this wallet address using the public email ({linkedWallets[0].email}) via AlgoLink services.
                  </p>
                </Label>
                <Switch
                  id={`privacy-${linkedWallets[0].id}`}
                  checked={linkedWallets[0].isPublic}
                  onCheckedChange={(checked) => handlePrivacyToggle(linkedWallets[0].id, checked)}
                  aria-label={`Toggle public resolvability for ${linkedWallets[0].email}`}
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                    <Trash2Icon className="mr-2 h-4 w-4" /> Unlink this Wallet
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently unlink the wallet <strong className="font-mono">{linkedWallets[0].walletAddress.substring(0,8)}...</strong> associated with the public email <strong className="break-all">{linkedWallets[0].email}</strong> from your AlgoLink account. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemoveWallet(linkedWallets[0].id)}>
                      Yes, Unlink Wallet
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center shadow-md">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <CardTitle className="text-xl font-semibold text-foreground mb-2">No Wallet Linked</CardTitle>
            <CardDescription className="mt-2">
              Link a wallet first to manage its settings.
            </CardDescription>
            <Button asChild size="lg" className="mt-6">
              <Link href="/linkWallet">
                <LinkIconLucide className="mr-2 h-5 w-5" />
                Link Your Wallet Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
