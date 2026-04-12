// src/components/explorer/GlobalStatsBar.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Layers, CircleDollarSign, AlertTriangle, ListChecks, Shield, Users, Zap, Activity } from 'lucide-react';
import { getCombinedMarketStats, type CombinedMarketStats } from '@/app/actions/marketDataActions';
import StatCard from '@/components/explorer/StatCard';

export default function GlobalStatsBar() {
  const [stats, setStats] = useState<CombinedMarketStats>({
    algoPriceUSD: null,
    marketCapUSD: null,
    volume24hUSD: null,
    circulatingSupply: null,
    totalSupplyCoinGecko: null,
    currentRound: null,
    onlineMoney: null,
    totalMoneyAlgoNode: null,
  });
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevTotalTransactions, setPrevTotalTransactions] = useState<number | null>(null);
  const [transactionActivity, setTransactionActivity] = useState<number | null>(null);


  const fetchData = useCallback(async (isInitialFetch: boolean) => {
    if (isInitialFetch) setIsLoadingInitial(true);
    try {
      const fetchedStats = await getCombinedMarketStats();
      if (fetchedStats.error) {
        setError(fetchedStats.error);
        // Preserve previous valid stats if only a partial error occurs
        setStats(prev => ({
            ...prev, // Keep existing values
            algoPriceUSD: fetchedStats.algoPriceUSD ?? prev.algoPriceUSD,
            marketCapUSD: fetchedStats.marketCapUSD ?? prev.marketCapUSD,
            volume24hUSD: fetchedStats.volume24hUSD ?? prev.volume24hUSD,
            circulatingSupply: fetchedStats.circulatingSupply ?? prev.circulatingSupply,
            totalSupplyCoinGecko: fetchedStats.totalSupplyCoinGecko ?? prev.totalSupplyCoinGecko,
            currentRound: fetchedStats.currentRound ?? prev.currentRound,
            onlineMoney: fetchedStats.onlineMoney ?? prev.onlineMoney,
            totalMoneyAlgoNode: fetchedStats.totalMoneyAlgoNode ?? prev.totalMoneyAlgoNode,
            recentTransactionsMocked: fetchedStats.recentTransactionsMocked ?? prev.recentTransactionsMocked,
        }));

      } else {
        // Calculate transaction activity
        if (prevTotalTransactions !== null && fetchedStats.recentTransactionsMocked !== null && fetchedStats.recentTransactionsMocked !== undefined) {
          setTransactionActivity(fetchedStats.recentTransactionsMocked - prevTotalTransactions);
        }
        setPrevTotalTransactions(fetchedStats.recentTransactionsMocked ?? null);
        setStats(fetchedStats); // Update all stats if no error
        setError(null);
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch global market stats.");
      // Optionally, set some indicator for stats if fetch totally fails
    } finally {
        if (isInitialFetch) setIsLoadingInitial(false);
    }
  }, [prevTotalTransactions]);

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const circulatingSupplyPercent = stats.circulatingSupply && stats.totalMoneyAlgoNode && stats.totalMoneyAlgoNode > 0
    ? `${((stats.circulatingSupply / stats.totalMoneyAlgoNode) * 100).toFixed(1)}%`
    : null;

  return (
    <Card className="mb-6 sm:mb-8 shadow-lg rounded-xl">
      <CardContent className="p-3 sm:p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          title="ALGO Price"
          value={stats.algoPriceUSD}
          unit="$"
          icon={DollarSign}
          isLoading={isLoadingInitial && stats.algoPriceUSD === null}
          isError={!!error && stats.algoPriceUSD === null}
        />
        <StatCard
          title="Market Cap"
          value={stats.marketCapUSD}
          unit="$"
          icon={TrendingUp}
          isLoading={isLoadingInitial && stats.marketCapUSD === null}
          isError={!!error && stats.marketCapUSD === null}
        />
        <StatCard
          title="24h Volume"
          value={stats.volume24hUSD}
          unit="$"
          icon={TrendingUp}
          isLoading={isLoadingInitial && stats.volume24hUSD === null}
          isError={!!error && stats.volume24hUSD === null}
        />
        <StatCard
          title="Circulating Supply"
          value={stats.circulatingSupply}
          unit={circulatingSupplyPercent ? `ALGO (${circulatingSupplyPercent})` : "ALGO"}
          icon={CircleDollarSign}
          isLoading={isLoadingInitial && stats.circulatingSupply === null}
          isError={!!error && stats.circulatingSupply === null}
          tooltip={stats.totalMoneyAlgoNode ? `Total created on-chain: ${stats.totalMoneyAlgoNode.toLocaleString()} ALGO. CoinGecko Total Supply: ${stats.totalSupplyCoinGecko ? stats.totalSupplyCoinGecko.toLocaleString() : 'N/A'} ALGO.` : 'Data for total created ALGO pending.'}
        />
         <StatCard
          title="Latest Round"
          value={stats.currentRound}
          icon={Zap}
          isLoading={isLoadingInitial && stats.currentRound === null}
          isError={!!error && stats.currentRound === null}
          tooltip="Current Algorand round."
        />
        <StatCard
          title="Online Stake"
          value={stats.onlineMoney}
          unit="ALGO"
          icon={Layers}
          isLoading={isLoadingInitial && stats.onlineMoney === null}
          isError={!!error && stats.onlineMoney === null}
          tooltip="Total ALGO participating in consensus."
        />
        <StatCard
          title="Transaction Activity (last 10s)"
          value={transactionActivity}
          unit="TXs"
          icon={Activity}
          isLoading={isLoadingInitial && transactionActivity === null}
          isError={!!error && stats.recentTransactionsMocked === null && transactionActivity === null}
          tooltip="Number of transactions in the last 10-second interval. May be 0 if no new blocks in interval."
        />
      </CardContent>
       {error && !isLoadingInitial && (
         <div className="p-3 pt-0 text-center">
            <p className="text-xs text-destructive flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3 inline-block"/>
                Data refresh issue: {error.length > 60 ? error.substring(0,60) + "..." : error}
            </p>
         </div>
        )}
    </Card>
  );
}
