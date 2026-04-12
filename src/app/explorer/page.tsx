
// src/app/explorer/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, FormEvent } from 'react';
import { searchAlgorand, type SearchResult } from '@/app/actions/explorerActions';
import NftCard from '@/components/explorer/NftCard';
import GlobalStatsBar from '@/components/explorer/GlobalStatsBar';
import TopGainersTable from '@/components/explorer/TopGainersTable';
import RecentSearchesDisplay from '@/components/explorer/RecentSearchesDisplay';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { SearchIcon, Info, Compass, FileText, Loader2, AlertTriangle as AlertTriangleIcon, Code2Icon, EyeIcon, EyeOffIcon, BoxIcon, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NftData, AccountData, TransactionData, ApplicationData, BlockData, Network } from '@/types/explorer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';


function ExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryFromUrl = searchParams.get('query');

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showRawProgram, setShowRawProgram] = useState<Record<string, boolean>>({});

  const { recentSearches, addSearch: addRecentSearch, clearSearches: clearRecentSearches } = useRecentSearches();

  useEffect(() => {
    async function performSearch() {
      const trimmedQueryFromUrl = queryFromUrl?.trim();
      if (!trimmedQueryFromUrl) {
        setSearchResult(null);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await searchAlgorand(trimmedQueryFromUrl);
        if (result.error) {
          setError(result.error);
          setSearchResult(null);
        } else {
          setSearchResult(result);
          addRecentSearch(trimmedQueryFromUrl);
        }
      } catch (e: any) {
        console.error("Search error:", e);
        setError(e.message || "Failed to perform search. Please try again.");
        setSearchResult(null);
      } finally {
        setIsLoading(false);
      }
    }
    if (queryFromUrl) { 
        performSearch();
    } else { 
        setSearchResult(null);
        setIsLoading(false);
        setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl]);

  const handleLocalSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = localSearchQuery.trim();
    if (trimmedQuery) {
      router.push(`/explorer?query=${encodeURIComponent(trimmedQuery)}`);
      setLocalSearchQuery('');
    } else {
      router.push(`/explorer`); 
    }
  };
  
  const handleRecentSearchClick = (searchQuery: string) => {
    router.push(`/explorer?query=${encodeURIComponent(searchQuery)}`);
     setLocalSearchQuery('');
  };

  const toggleShowRawProgram = (appId: number, network: Network, type: 'approval' | 'clear') => {
    const key = `${appId}-${network}-${type}`;
    setShowRawProgram(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderNetworkBadge = (itemNetwork: Network) => (
    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${itemNetwork === 'mainnet' ? 'border-blue-500 text-blue-600 bg-blue-500/10' : 'border-orange-500 text-orange-600 bg-orange-500/10'}`}>
      {itemNetwork.toUpperCase()}
    </Badge>
  );

  const renderRelatedBadge = () => (
    <Badge variant="outline" className="ml-1.5 text-xs border-amber-500 text-amber-600 bg-amber-500/5 shrink-0">Related</Badge>
  );


  const renderLoadingSkeletons = () => (
    <div className="space-y-8 mt-6">
      {[1, 2, 3].map(i => (
        <Card key={i} className="shadow-md rounded-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-md mt-2" />
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const hasResults = searchResult && (searchResult.accounts.length > 0 || searchResult.transactions.length > 0 || searchResult.nfts.length > 0 || searchResult.applications.length > 0 || searchResult.blocks.length > 0);

  const defaultTab = 
    searchResult?.accounts.length ? "accounts" :
    searchResult?.transactions.length ? "transactions" :
    searchResult?.nfts.length ? "nfts" : 
    searchResult?.applications.length ? "applications" :
    searchResult?.blocks.length ? "blocks" : "accounts";
  
  const queryUpper = queryFromUrl?.trim().toUpperCase();

  return (
    <div className="space-y-6">
      <GlobalStatsBar />

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
              <Compass className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">AlgoLink Explorer</CardTitle>
            </div>
            <CardDescription className="text-lg">
             Explore the Algorand blockchain.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLocalSearchSubmit} className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search Address, TxID, Asset ID, App ID, Block Round, or AlgoLink Email..."
              className="flex-grow text-base h-12 px-4 rounded-full border-border focus:ring-primary focus:border-primary"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            <Button type="submit" size="lg" className="rounded-full px-6 h-12">
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {queryFromUrl?.trim() && (
          <p className="text-center text-muted-foreground">
            Results for: <strong className="text-primary break-all">{queryFromUrl.trim()}</strong>
          </p>
      )}

      {isLoading && renderLoadingSkeletons()}
      
      {error && (
        <Alert variant="destructive" className="shadow-md rounded-lg">
          <AlertTriangleIcon className="h-5 w-5" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && queryFromUrl?.trim() && !hasResults && (
        <Card className="text-center shadow-md rounded-lg">
          <CardContent className="py-16">
            <Info className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <p className="text-2xl font-semibold">No results found for "{queryFromUrl.trim()}".</p>
            <p className="text-muted-foreground mt-2">Try a different query or check spelling.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && queryFromUrl?.trim() && hasResults && searchResult && (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="accounts" disabled={searchResult.accounts.length === 0}>Accounts ({searchResult.accounts.length})</TabsTrigger>
            <TabsTrigger value="transactions" disabled={searchResult.transactions.length === 0}>Transactions ({searchResult.transactions.length})</TabsTrigger>
            <TabsTrigger value="nfts" disabled={searchResult.nfts.length === 0}>Assets/NFTs ({searchResult.nfts.length})</TabsTrigger>
            <TabsTrigger value="applications" disabled={searchResult.applications.length === 0}>Applications ({searchResult.applications.length})</TabsTrigger>
            <TabsTrigger value="blocks" disabled={searchResult.blocks.length === 0}>Blocks ({searchResult.blocks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-6 space-y-4">
            {searchResult.accounts.map((acc: AccountData) => {
              const isRelatedItem = acc.address.toUpperCase() !== queryUpper;
              return (
              <Card key={`${acc.address}-${acc.network}`} className="shadow-md rounded-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/explorer/account/${acc.address}?network=${acc.network}`} className="hover:underline">
                      <CardTitle className="text-lg font-mono break-all flex items-center">
                        <UserCircle className="h-5 w-5 mr-2 text-muted-foreground"/>
                        {acc.address}
                        {isRelatedItem && renderRelatedBadge()}
                        </CardTitle>
                    </Link>
                    {renderNetworkBadge(acc.network)}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <p><strong className="text-primary">Balance:</strong> {acc.balance.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</p>
                  <p><strong className="text-primary">Assets:</strong> {acc.assetCount?.toLocaleString()}</p>
                  <p><strong className="text-primary">App Opt-ins:</strong> {acc.appsLocalStateCount?.toLocaleString()}</p>
                  <p><strong className="text-primary">App Created:</strong> {acc.appsCreatedCount?.toLocaleString()}</p>
                </CardContent>
              </Card>
            );
            })}
          </TabsContent>

          <TabsContent value="transactions" className="mt-6 space-y-4">
            {searchResult.transactions.map((tx: TransactionData) => {
              const isDirectIdMatch = tx.id.toUpperCase() === queryUpper;
              const queryWasLikelyGroupId = searchResult.transactions.some(t => t.group?.toUpperCase() === queryUpper);
              const isPartOfDirectlyQueriedGroup = queryWasLikelyGroupId && tx.group?.toUpperCase() === queryUpper;
              const isRelatedItem = !isDirectIdMatch && !isPartOfDirectlyQueriedGroup;

              return (
              <Card key={`${tx.id}-${tx.network}`} className="shadow-md rounded-lg">
                <CardHeader>
                   <div className="flex justify-between items-start">
                    <Link href={`/explorer/tx/${tx.id}?network=${tx.network}`} className="hover:underline">
                      <CardTitle className="text-base font-mono break-all flex items-center">
                        ID: {tx.id}
                        {isRelatedItem && renderRelatedBadge()}
                        </CardTitle>
                    </Link>
                    {renderNetworkBadge(tx.network)}
                  </div>
                  <div className="flex gap-2 items-center mt-1">
                    <Badge variant={tx.type === 'pay' ? 'default' : tx.type === 'axfer' ? 'secondary' : ['appl','app'].includes(tx.type) ? 'outline' : 'destructive'} className="w-fit">{tx.type ? tx.type.toUpperCase() : 'UNKNOWN'}</Badge>
                    {tx.group && <Badge variant="outline" className="w-fit font-mono text-xs" title="Group ID">GRP: <Link href={`/explorer?query=${tx.group}`} className="hover:underline">{tx.group.substring(0,8)}...</Link></Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                  <p><strong className="text-primary">Sender:</strong> <Link href={`/explorer/account/${tx.sender}?network=${tx.network}`} className="font-mono hover:underline break-all">{tx.sender}</Link></p>
                  {tx.receiver && <p><strong className="text-primary">Receiver:</strong> <Link href={`/explorer/account/${tx.receiver}?network=${tx.network}`} className="font-mono hover:underline break-all">{tx.receiver}</Link></p>}
                  {tx.amount !== undefined && tx.type === 'pay' && <p><strong className="text-primary">Amount:</strong> {tx.amount.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</p>}
                  {tx.assetId && tx.assetAmount !== undefined && tx.txTypeSpecific.assetTransfer && (
                    <p><strong className="text-primary">Asset:</strong> ID <Link href={`/explorer/asset/${tx.assetId}?network=${tx.network}`} className="font-mono hover:underline">{tx.assetId}</Link>, Amount: {tx.assetAmount.toLocaleString()}</p>
                  )}
                  {tx.applicationId && (<p><strong className="text-primary">App ID:</strong> <Link href={`/explorer/app/${tx.applicationId}?network=${tx.network}`} className="font-mono hover:underline">{tx.applicationId}</Link></p>)}
                  <p><strong className="text-primary">Fee:</strong> {tx.fee.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</p>
                  <p><strong className="text-primary">Confirmed:</strong> {tx.confirmedRound ? <Link href={`/explorer/block/${tx.confirmedRound}?network=${tx.network}`} className="font-mono hover:underline">{tx.confirmedRound}</Link> : 'Pending'} ({tx.roundTime ? formatDistanceToNow(new Date(tx.roundTime * 1000), { addSuffix: true }) : 'N/A'})</p>
                  {tx.note && <p><strong className="text-primary">Note:</strong> <span className="font-mono bg-muted p-1 rounded text-xs break-all">{tx.note}</span></p>}
                </CardContent>
              </Card>
            );
            })}
          </TabsContent>
          
          <TabsContent value="nfts" className="mt-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResult.nfts.map((nft: NftData) => {
                 const isRelatedItem = nft.id.toUpperCase() !== queryUpper;
                return <NftCard key={`${nft.id}-${nft.network}`} nft={nft} isRelated={isRelatedItem} />;
              })}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-6 space-y-4">
            {searchResult.applications.map((app: ApplicationData) => {
                const isRelatedItem = app.id.toString().toUpperCase() !== queryUpper;
                return (
                 <Card key={`${app.id}-${app.network}`} className="shadow-md rounded-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Link href={`/explorer/app/${app.id}?network=${app.network}`} className="hover:underline">
                          <CardTitle className="text-lg flex items-center gap-2">
                              <Code2Icon className="h-6 w-6 text-primary" />
                              Application ID: {app.id}
                              {isRelatedItem && renderRelatedBadge()}
                          </CardTitle>
                        </Link>
                        {renderNetworkBadge(app.network)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong className="text-primary">Creator:</strong> <Link href={`/explorer/account/${app.creator}?network=${app.network}`} className="font-mono hover:underline break-all">{app.creator}</Link></p>
                        {app.globalStateSchema && <p><strong className="text-primary">Global Schema:</strong> {app.globalStateSchema.numUint} Uint, {app.globalStateSchema.numByteSlice} ByteSlice</p>}
                        {app.localStateSchema && <p><strong className="text-primary">Local Schema:</strong> {app.localStateSchema.numUint} Uint, {app.localStateSchema.numByteSlice} ByteSlice</p>}
                        {app.extraProgramPages !== undefined && <p><strong className="text-primary">Extra Pages:</strong> {app.extraProgramPages}</p>}
                        
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="approval-program">
                                <AccordionTrigger className="text-sm font-medium">
                                    <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Approval Program (TEAL)</div>
                                </AccordionTrigger>
                                <AccordionContent className="max-h-96 overflow-y-auto">
                                    <Button variant="outline" size="sm" onClick={() => toggleShowRawProgram(app.id, app.network, 'approval')} className="mb-2 text-xs h-7">
                                        {showRawProgram[`${app.id}-${app.network}-approval`] ? <EyeOffIcon className="mr-1.5 h-3.5 w-3.5" /> : <EyeIcon className="mr-1.5 h-3.5 w-3.5" />}
                                        {showRawProgram[`${app.id}-${app.network}-approval`] ? 'Hide Raw' : 'Show Raw'}
                                    </Button>
                                    <pre className={`p-2 bg-muted rounded-md text-xs overflow-x-auto ${!showRawProgram[`${app.id}-${app.network}-approval`] ? 'max-h-24 blur-sm select-none' : 'max-h-96'}`}>
                                        {Buffer.from(app.approvalProgram, 'base64').toString('utf-8')}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="clear-state-program">
                                <AccordionTrigger className="text-sm font-medium">
                                   <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Clear State Program (TEAL)</div>
                                </AccordionTrigger>
                                <AccordionContent className="max-h-96 overflow-y-auto">
                                     <Button variant="outline" size="sm" onClick={() => toggleShowRawProgram(app.id, app.network, 'clear')} className="mb-2 text-xs h-7">
                                        {showRawProgram[`${app.id}-${app.network}-clear`] ? <EyeOffIcon className="mr-1.5 h-3.5 w-3.5" /> : <EyeIcon className="mr-1.5 h-3.5 w-3.5" />}
                                        {showRawProgram[`${app.id}-${app.network}-clear`] ? 'Hide Raw' : 'Show Raw'}
                                    </Button>
                                    <pre className={`p-2 bg-muted rounded-md text-xs overflow-x-auto ${!showRawProgram[`${app.id}-${app.network}-clear`] ? 'max-h-24 blur-sm select-none' : 'max-h-96'}`}>
                                        {Buffer.from(app.clearStateProgram, 'base64').toString('utf-8')}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                            {app.globalState && app.globalState.length > 0 && (
                                <AccordionItem value="global-state">
                                    <AccordionTrigger className="text-sm font-medium">Global State ({app.globalState.length})</AccordionTrigger>
                                    <AccordionContent className="max-h-60 overflow-y-auto text-xs">
                                    {app.globalState.map((item, index) => (
                                        <div key={`${app.id}-globalstate-${item.key}-${index}`} className="mb-1.5 p-1.5 bg-muted/50 rounded font-mono">
                                            <strong className="block break-all" title={item.key}>Key: {item.key}</strong>
                                             <div className="ml-1 break-all" title={item.value.type === 1 ? (item.value.bytes || 'N/A') : (item.value.uint !== undefined ? item.value.uint.toString() : 'N/A')}>
                                                Value: {item.value.type === 1 
                                                            ? (item.value.bytes || 'N/A (empty bytes)')
                                                            : (item.value.uint !== undefined ? item.value.uint.toString() : 'N/A (uint)')
                                                          } 
                                                (Type: {item.value.type === 1 ? 'Bytes' : 'Uint'})
                                            </div>
                                        </div>
                                    ))}
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                        </Accordion>
                    </CardContent>
                 </Card>
            );
            })}
          </TabsContent>
          
          <TabsContent value="blocks" className="mt-6 space-y-4">
            {searchResult.blocks.map((block: BlockData) => {
              const isRelatedItem = block.round.toString().toUpperCase() !== queryUpper;
              return (
              <Card key={`${block.round}-${block.network}`} className="shadow-md rounded-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Link href={`/explorer/block/${block.round}?network=${block.network}`} className="hover:underline">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BoxIcon className="h-6 w-6 text-primary" />
                        Block Round: {block.round.toLocaleString()}
                         {isRelatedItem && renderRelatedBadge()}
                      </CardTitle>
                    </Link>
                    {renderNetworkBadge(block.network)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                  <p><strong className="text-primary">Timestamp:</strong> {new Date(block.timestamp * 1000).toLocaleString()} ({formatDistanceToNow(new Date(block.timestamp * 1000), { addSuffix: true })})</p>
                  <p><strong className="text-primary">Transactions:</strong> {block.transactionCount.toLocaleString()}</p>
                  <p><strong className="text-primary">Proposer:</strong> <Link href={`/explorer/account/${block.proposer}?network=${block.network}`} className="font-mono hover:underline break-all">{block.proposer}</Link></p>
                  <p><strong className="text-primary">Block Hash:</strong> <span className="font-mono break-all text-xs">{block.blockHash}</span></p>
                </CardContent>
              </Card>
            );
            })}
          </TabsContent>

        </Tabs>
      )}

      {!queryFromUrl?.trim() && !isLoading && !error && (
         <>
            <RecentSearchesDisplay 
              searches={recentSearches}
              onSearch={handleRecentSearchClick}
              onClear={clearRecentSearches}
            />
            <TopGainersTable />
         </>
      )}
    </div>
  );
}


export default function ExplorerPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading explorer...</p>
      </div>
    }>
      <ExplorerContent />
    </Suspense>
  );
}
