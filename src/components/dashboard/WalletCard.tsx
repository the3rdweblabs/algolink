// src/components/dashboard/WalletCard.tsx
'use client';

import type { WalletLink } from '@/types';
import { useEffect, useState } from 'react';
import { detectSuspiciousAddress, type DetectSuspiciousAddressOutput } from '@/ai/flows/detect-suspicious-address';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface WalletCardProps {
  walletLink: WalletLink;
}

export default function WalletCard({ walletLink }: WalletCardProps) {
  const [detectionResult, setDetectionResult] = useState<DetectSuspiciousAddressOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAddress() {
      if (!walletLink.walletAddress) {
        setIsLoading(false);
        setError("No wallet address provided.");
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const result = await detectSuspiciousAddress({
          address: walletLink.walletAddress,
          userExpectedAddress: walletLink.userExpectedAddress,
          userTransactionHistory: walletLink.transactionHistory,
        });
        setDetectionResult(result);
      } catch (e) {
        console.error("Error detecting suspicious address:", e);
        setError("Failed to analyze address. Displaying original.");
      } finally {
        setIsLoading(false);
      }
    }
    checkAddress();
  }, [walletLink.walletAddress, walletLink.userExpectedAddress, walletLink.transactionHistory]);

  const displayAddress = detectionResult?.isSuspicious && detectionResult.suggestedAddress 
                         ? detectionResult.suggestedAddress 
                         : walletLink.walletAddress;
                         
  const wasCorrected = detectionResult?.isSuspicious && 
                       detectionResult.suggestedAddress && 
                       detectionResult.suggestedAddress !== walletLink.walletAddress;

  const isFlaggedSuspicious = detectionResult?.isSuspicious && !wasCorrected;
  const isValidatedSafe = !detectionResult?.isSuspicious && detectionResult?.reason; // AI confirmed safe

  const renderAddressStatusIcon = () => {
    if (isLoading) return <Skeleton className="h-5 w-5 rounded-full" />;
    if (error && !detectionResult) return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (wasCorrected) return <ShieldAlert className="h-5 w-5 text-orange-500" />;
    if (isFlaggedSuspicious) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (isValidatedSafe) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <Info className="h-5 w-5 text-blue-500" />; // Default or if AI error but original shown
  };

  const getTooltipContent = () => {
    if (isLoading) return "Analyzing address...";
    if (error && !detectionResult) return `Error: ${error}. Original: ${walletLink.walletAddress}`;
    if (detectionResult?.isSuspicious) {
      let content = `AI Analysis: ${detectionResult.reason}`;
      if (wasCorrected) {
        content += `\nOriginal: ${walletLink.walletAddress}\nSuggested: ${detectionResult.suggestedAddress}`;
      } else if (detectionResult.suggestedAddress) {
         content += `\nConsidered: ${detectionResult.suggestedAddress}`;
      }
      return content;
    }
    if (isValidatedSafe) return `AI Analysis: ${detectionResult.reason || "Address appears valid."}`;
    return "Address displayed as provided. AI analysis pending or inconclusive.";
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-primary truncate">{walletLink.email}</CardTitle>
        <CardDescription>Linked Algorand Wallet</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Separator />
        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Address:</p>
          {isLoading ? (
            <Skeleton className="h-7 w-full rounded-md" />
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 p-2.5 rounded-md bg-muted/70 hover:bg-muted cursor-help break-all">
                    {renderAddressStatusIcon()}
                    <span className="font-mono text-sm leading-tight">{displayAddress}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs whitespace-pre-line p-3" side="bottom" align="start">
                  {getTooltipContent()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        {walletLink.isPublic ? (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Publicly Resolvable
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Info className="mr-1 h-3 w-3" /> Private
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
