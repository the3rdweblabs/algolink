
// src/app/actions/marketDataActions.ts
'use server';

// Coingecko market data structure
export interface CoinGeckoMarketData {
  algoPriceUSD: number | null;
  marketCapUSD: number | null;
  volume24hUSD: number | null;
  circulatingSupply: number | null;
  totalSupplyCoinGecko: number | null; // Renamed to avoid clash with AlgoNode's totalMoney
}

// AlgoNode ledger supply structure
export interface AlgoNodeLedgerSupply {
  currentRound: number | null;
  onlineMoney: number | null; // in ALGO
  totalMoneyAlgoNode: number | null; // in ALGO, Renamed to avoid clash
}

export interface CombinedMarketStats extends CoinGeckoMarketData, AlgoNodeLedgerSupply {
  recentTransactionsMocked?: number | null;
  activeValidatorsMocked?: number | null;
  algoHoldersEstMocked?: string | null; // Using string to accommodate "M" for millions
  error?: string;
}

const COINGECKO_API_URL_ALGORAND = process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3/coins/algorand?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
const ALGORAND_INDEXER_API_BASES = {
  mainnet: process.env.NEXT_PUBLIC_INDEXER_SERVER_MAINNET?.replace('/v2', '') || 'https://mainnet-idx.algonode.cloud',
  testnet: process.env.NEXT_PUBLIC_INDEXER_SERVER_TESTNET?.replace('/v2', '') || 'https://testnet-idx.algonode.cloud',
};

const rawNetworkEnv = process.env.NEXT_PUBLIC_ALGORAND_NETWORK?.trim().toLowerCase();
const APP_NETWORK: 'mainnet' | 'testnet' =
  rawNetworkEnv === 'testnet' ? 'testnet' : 'mainnet'; // Default to mainnet for invalid or undefined

const CURRENT_INDEXER_BASE = ALGORAND_INDEXER_API_BASES[APP_NETWORK];

export async function getCombinedMarketStats(): Promise<CombinedMarketStats> {
  console.log(`[BUILD-DEBUG] getCombinedMarketStats called in phase: ${process.env.NEXT_PHASE}`);
  // During build phase, skip external network calls to avoid timeouts
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      algoPriceUSD: null, marketCapUSD: null, volume24hUSD: null,
      circulatingSupply: null, totalSupplyCoinGecko: null,
      currentRound: null, onlineMoney: null, totalMoneyAlgoNode: null,
    };
  }

  let coingeckoData: CoinGeckoMarketData = {
    algoPriceUSD: null,
    marketCapUSD: null,
    volume24hUSD: null,
    circulatingSupply: null,
    totalSupplyCoinGecko: null,
  };
  let algonodeData: AlgoNodeLedgerSupply = {
    currentRound: null,
    onlineMoney: null,
    totalMoneyAlgoNode: null,
  };
  let coingeckoError: string | undefined;
  let algonodeError: string | undefined;

  // Add nulls for the new mocked stats; they won't be fetched live by this action
      const mockedStats: { recentTransactionsMocked: number | null, activeValidatorsMocked: number | null, algoHoldersEstMocked: string | null } = {
        recentTransactionsMocked: null,
        activeValidatorsMocked: null,
        algoHoldersEstMocked: null,
      };

  try {
    const coingeckoResponse = await fetch(COINGECKO_API_URL_ALGORAND, {
      next: { revalidate: 60 }, // Cache CoinGecko data for 1 minute
    });

    if (!coingeckoResponse.ok) {
      const errorText = await coingeckoResponse.text();
      console.error('CoinGecko API Error:', coingeckoResponse.status, errorText);
      coingeckoError = `CoinGecko API Error: ${coingeckoResponse.status}`;
    } else {
      const data = await coingeckoResponse.json();
      if (data.market_data) {
        coingeckoData = {
          algoPriceUSD: data.market_data.current_price?.usd ?? null,
          marketCapUSD: data.market_data.market_cap?.usd ?? null,
          volume24hUSD: data.market_data.total_volume?.usd ?? null,
          circulatingSupply: data.market_data.circulating_supply ?? null,
          totalSupplyCoinGecko: data.market_data.total_supply ?? null,
        };
      } else {
        coingeckoError = 'Market data not found in CoinGecko response.';
      }
    }
  } catch (error: any) {
    console.error('Error fetching from CoinGecko:', error);
    coingeckoError = error.message || 'CoinGecko request failed.';
  }

  try {
    const algonodeUrl = `${CURRENT_INDEXER_BASE}/v2/ledger/supply`;
    const algonodeResponse = await fetch(algonodeUrl, {
      next: { revalidate: 10 }, // Cache AlgoNode ledger data for 10 seconds
    });
    if (!algonodeResponse.ok) {
      const errorText = await algonodeResponse.text();
      console.error(`AlgoNode Indexer API Error (${APP_NETWORK} - ${algonodeUrl}):`, algonodeResponse.status, errorText);
      algonodeError = `AlgoNode API Error: ${algonodeResponse.status}`;
    } else {
      const data = await algonodeResponse.json();
      algonodeData = {
        currentRound: data['current-round'] ?? null,
        onlineMoney: data['online-money'] ? data['online-money'] / 1_000_000 : null,
        totalMoneyAlgoNode: data['total-money'] ? data['total-money'] / 1_000_000 : null,
      };
      // For demonstration, let's derive recent transactions from total transactions
      // In a real app, you might use a more direct metric if available
      mockedStats.recentTransactionsMocked = data['total-money'] ? Math.floor(data['total-money'] / 10000) : null;
    }
  } catch (error: any) {
    console.error('Error fetching from AlgoNode:', error);
    algonodeError = error.message || 'AlgoNode request failed.';
  }

  const combinedErrorMessages = [coingeckoError, algonodeError].filter(Boolean);
  const finalError = combinedErrorMessages.length > 0 ? combinedErrorMessages.join('; ') : undefined;

  return {
    ...coingeckoData,
    ...algonodeData,
    ...mockedStats, // Include the nulls for mocked stats
    error: finalError,
  };
}
