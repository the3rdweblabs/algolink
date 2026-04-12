// src/app/linkWallet/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { MailIcon, WalletIcon, LogOut, LinkIcon as LinkIconLucide, Loader2, Sparkles, Navigation, XIcon } from 'lucide-react';
import { linkWalletToUser, removeWalletLink, getWalletsForUser } from '@/app/actions/walletActions';
import type { WalletLink } from '@/types';
import { getCurrentUser } from '@/app/actions/authActions';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';

const RAW_APP_NETWORK_NAME = process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'mainnet';
const APP_NETWORK_NAME = RAW_APP_NETWORK_NAME.trim().toLowerCase() as 'testnet' | 'mainnet';


const ALGOD_SERVER = process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = parseInt(process.env.NEXT_PUBLIC_ALGOD_PORT || '443');
const ALGOD_TOKEN = process.env.NEXT_PUBLIC_ALGOD_TOKEN || '';

const FEE_ADDRESS = process.env.NEXT_PUBLIC_FEE_ADDRESS || "G5YFEC2BD3BXZJ3OEM4E5SXTFPLXUO3FUS667MY6TSM2XAYNNHALHZ623U";
const FEE_AMOUNT_MICROALGOS = parseInt(process.env.NEXT_PUBLIC_FEE_AMOUNT_MICROALGOS || '1000'); // Default 0.001 ALGO

/**
 * Converts MicroAlgos to Algos for display.
 */
const microAlgosToAlgos = (microalgos: number): string => {
  return (microalgos / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
};

const DISPLAY_FEE_ALGO = microAlgosToAlgos(FEE_AMOUNT_MICROALGOS);

export default function LinkWalletPage() {
  const {
    activeAddress,
    activeWallet,
    signTransactions,
    wallets
  } = useWallet();

  const [linkedDetailsForAccount, setLinkedDetailsForAccount] = useState<{ email: string, id: string } | null>(null);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; isVerified: boolean } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const algodClient = useRef(new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT));

  const fetchLinkedDetails = useCallback(async (accountAddress: string) => {
    const userWallets = await getWalletsForUser();
    const existingLink = userWallets.find(link => link.walletAddress === accountAddress);
    if (existingLink) {
      setLinkedDetailsForAccount({ email: existingLink.email, id: existingLink.id });
    } else {
      setLinkedDetailsForAccount(null);
    }
  }, []);


  useEffect(() => {
    async function fetchUser() {
      setIsLoadingUser(true);
      const user = await getCurrentUser();
      const simplifiedUser = user ? { id: user.userId, email: user.email, isVerified: user.isVerified } : null;
      setCurrentUser(simplifiedUser);
      setIsLoadingUser(false);

      if (user && !user.isVerified) {
        toast({
          title: "Email Verification Required",
          description: `Your account email (${user.email}) needs to be verified. Please complete the OTP login process.`,
          variant: "destructive",
        });
      }
    }
    fetchUser();
  }, [toast]);

  useEffect(() => {
    if (activeAddress) {
      fetchLinkedDetails(activeAddress);
    } else {
      setLinkedDetailsForAccount(null);
    }
  }, [activeAddress, fetchLinkedDetails]);

  const handleConnect = async (walletId: WalletId) => {
    setIsWalletModalOpen(false);
    setIsProcessing(true);
    try {
      const wallet = wallets?.find(w => w.id === walletId);
      if (!wallet) {
        toast({ title: "Error", description: "Wallet provider not found.", variant: "destructive" });
        return;
      }
      await wallet.connect();
      toast({ title: "Wallet Connected", description: `Successfully connected to ${wallet.metadata.name}.` });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({ title: "Connection Failed", description: error.message || "Could not connect wallet.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLink = async () => {
    // 1. Capture reactive state into local constants immediately to prevent mid-flow state loss
    const currentAddress = activeAddress;
    const currentWallet = activeWallet;
    // Ensure FEE_ADDRESS is a clean string
    const targetFeeAddress = (FEE_ADDRESS || "").trim();

    if (!currentAddress || !currentWallet) {
      toast({ title: "Wallet Connection Required", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    if (!currentUser || !currentUser.isVerified) {
      toast({ title: "Authentication Required", description: "Please ensure you are logged in and verified.", variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    try {
      toast({ title: `Processing Linkage Fee (${DISPLAY_FEE_ALGO} ALGO)`, description: `Please sign the transaction in your wallet.` });

      // 2. Fetch transaction parameters
      const suggestedParams = await algodClient.current.getTransactionParams().do();
      
      // 3. Robust Defensive Validation
      if (!suggestedParams) {
        throw new Error("Failed to fetch transaction parameters from the Algorand network. Please try again.");
      }
      if (!currentAddress) {
        throw new Error("Local wallet address is missing. Please reconnect your wallet.");
      }
      if (!targetFeeAddress) {
        console.error("Critical: NEXT_PUBLIC_FEE_ADDRESS is not defined in environment variables.");
        throw new Error("System configuration error: Fee collection address is missing. Please contact support.");
      }

      console.log(`[Algorithm-Link-Debug] Creating txn from ${currentAddress} to ${targetFeeAddress}`);

      let txn;
      try {
        // 4. Create Transaction with explicit field mapping
        txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: currentAddress,
          receiver: targetFeeAddress,
          amount: FEE_AMOUNT_MICROALGOS,
          note: new Uint8Array(Buffer.from(`AlgoLink Wallet Linking Fee for ${currentUser.email}`)),
          suggestedParams: suggestedParams,
        });
      } catch (sdkError: any) {
        console.error("AlgoSDK Transaction Creation Error:", sdkError);
        // Special diagnostic for the common "Address must not be null or undefined" error
        const detailedError = sdkError.message === "Address must not be null or undefined" 
          ? "The Algorand SDK reported a missing address or invalid parameters. Checking your wallet connection..."
          : sdkError.message;
        throw new Error(`Failed to create transaction: ${detailedError}`);
      }

      const encodedTxn = txn.toByte();
      const signedTxns = await signTransactions([encodedTxn]);

      if (!signedTxns || signedTxns.length === 0 || !signedTxns[0]) {
        toast({ title: "Signing Cancelled", description: "Transaction signing was cancelled or failed.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      toast({ title: `Submitting Fee Transaction...`, description: "Please wait." });
      const response = await algodClient.current.sendRawTransaction(signedTxns[0]).do();
      const txId = (response as any).txId || (response as any).txid;
      await algosdk.waitForConfirmation(algodClient.current, txId, 4);
      toast({ title: "Fee Paid Successfully!", description: `Transaction ID: ${txId.substring(0, 10)}...` });

      const result = await linkWalletToUser({
        walletAddress: activeAddress,
        isPublic: true,
      });

      if ('error' in result) {
        toast({ title: "Linking Failed After Payment", description: `${result.error} Fee was paid but DB link failed. Contact support.`, variant: "destructive" });
      } else {
        setLinkedDetailsForAccount({ email: result.email, id: result.id });
        toast({ title: "Wallet Linked!", description: `Wallet ${activeAddress.substring(0, 8)}... successfully linked to your account (${result.email}).` });
      }

    } catch (error: any) {
      console.error(`Linking operation error:`, error);
      toast({ title: "Operation Failed", description: error?.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnectAndUnlink = async () => {
    setIsProcessing(true);
    try {
      if (linkedDetailsForAccount?.id) {
        const removeResult = await removeWalletLink(linkedDetailsForAccount.id);
        if (!removeResult.success) {
          toast({ title: "Unlinking Failed", description: removeResult.error || "Could not remove link from database.", variant: "destructive" });
        }
      }

      if (activeWallet) {
        await activeWallet.disconnect();
      }

      setLinkedDetailsForAccount(null);
      toast({ title: "Wallet Disconnected & Unlinked", description: "Successfully disconnected your wallet and unlinked it if applicable." });

    } catch (error: any) {
      console.error(`Disconnection or unlinking error:`, error);
      toast({ title: "Operation Failed", description: error?.message || "Could not disconnect or unlink wallet.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoadingUser) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="mr-2 h-6 w-6 animate-spin" />Loading user data...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MailIcon className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Please <Link href="/auth/authenticate" className="underline text-primary mx-1">log in or sign up</Link> to link an Algorand wallet.
        </p>
      </div>
    );
  }

  if (!currentUser.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MailIcon className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Email Verification Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your account email ({currentUser.email}) needs to be verified. Please complete the OTP login process.
        </p>
        <Button asChild>
          <Link href={`/auth/authenticate`}>
            Go to Authentication
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-lg shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center gap-3">
            <LinkIconLucide className="h-8 w-8" />
            <CardTitle className="text-3xl font-semibold">Link Algorand Wallet</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Link your account email to a single Algorand wallet.
            A {DISPLAY_FEE_ALGO} ALGO fee applies for linking.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!activeAddress ? (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium flex items-center gap-2 text-foreground">
                <MailIcon className="h-5 w-5 text-primary" />
                Your Account Email
              </p>
              <p className="text-base text-muted-foreground break-all">
                {currentUser.email}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This email is automatically tied to your chosen wallet. You can control its public visibility from your Settings page.
              </p>
            </div>
          ) : null}

          {activeAddress && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Connected Wallet ({activeWallet?.metadata.name})</Label>
                <div className="p-3 bg-muted rounded-md text-sm break-all font-mono" aria-label="Connected wallet address">
                  {activeAddress}
                </div>
              </div>
              {linkedDetailsForAccount?.email && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    This wallet is currently linked to your account ({currentUser.email}).
                  </p>
                </div>
              )}
              {!linkedDetailsForAccount?.email && (
                <p className="text-sm text-orange-600">
                  Clicking below will set this as your one linked wallet ({DISPLAY_FEE_ALGO} ALGO fee applies).
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 flex flex-col gap-4">
          {!activeAddress ? (
            <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full text-base py-3"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WalletIcon className="mr-2 h-5 w-5" />}
                  {isProcessing ? 'Processing...' : `Choose Wallet & Pay Fee to Link`}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xs p-0">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="text-lg text-center">Wallet Providers</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-3">
                  {wallets?.map((wallet) => (
                    <Button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      className="w-full justify-start text-base h-12 bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={isProcessing}
                    >
                      <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="mr-2 h-6 w-6" />
                      Connect {wallet.metadata.name}
                    </Button>
                  ))}
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="absolute right-3 top-3 p-1 opacity-70 hover:opacity-100">
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button
                onClick={handleLink}
                className="w-full text-base py-3"
                size="lg"
                disabled={!!linkedDetailsForAccount || isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LinkIconLucide className="mr-2 h-5 w-5" />}
                {isProcessing ? 'Processing...' : `Link Wallet (Fee)`}
              </Button>

              <Button onClick={handleDisconnectAndUnlink} variant="outline" className="w-full text-base py-3" size="lg" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
                Disconnect {activeWallet?.metadata.name} & Unlink
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      {currentUser && (
        <p className="text-center text-muted-foreground mt-8 max-w-md">
          Your wallet link is associated with your AlgoLink account: <strong className="font-medium">{currentUser.email}</strong>.
          <br />Manage link privacy in <Link href="/settings" className="text-primary underline">Settings</Link>.
        </p>
      )}
    </div>
  );
}

