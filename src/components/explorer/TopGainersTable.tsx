// src/components/explorer/TopGainersTable.tsx
'use client';

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Trophy, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTopPublicWalletsByBalance, type TopWallet } from "@/app/actions/walletActions";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopGainersTable() {
  const [topWallets, setTopWallets] = useState<TopWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopWallets() {
      setIsLoading(true);
      try {
        const wallets = await getTopPublicWalletsByBalance(5);
        setTopWallets(wallets);
      } catch (err: any) {
        console.error("Failed to fetch top wallets", err);
        setError("Could not load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopWallets();
  }, []);

  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
          <TableCell><Skeleton className="h-5 w-2/4" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-5 w-1/4 ml-auto" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
       return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive py-8">
            <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-8 w-8" />
                <p>{error}</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    if (topWallets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
            No public wallets linked yet to display a leaderboard.
          </TableCell>
        </TableRow>
      );
    }
    return topWallets.map((wallet, index) => (
      <TableRow key={wallet.walletAddress}>
        <TableCell className="font-medium text-lg">{index + 1}</TableCell>
        <TableCell>{wallet.email}</TableCell>
        <TableCell>
          <Link href={`/explorer/account/${wallet.walletAddress}?network=mainnet`} className="font-mono hover:underline">
            {wallet.walletAddress.substring(0, 12)}...{wallet.walletAddress.substring(wallet.walletAddress.length - 4)}
          </Link>
        </TableCell>
        <TableCell className="text-right">
          <Badge variant="outline" className="text-primary-foreground border-primary bg-primary/80">
            {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ALGO
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/explorer/account/${wallet.walletAddress}?network=mainnet`} title="View Account">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };


  return (
    <Card className="shadow-lg rounded-xl mt-6 sm:mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-amber-500" />
          <CardTitle className="text-2xl font-bold">Top Public Balances</CardTitle>
        </div>
        <CardDescription>
          Publicly shared AlgoLink addresses with the highest ALGO balance on MainNet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Linked Email</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderBody()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
