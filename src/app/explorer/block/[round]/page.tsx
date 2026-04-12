// src/app/explorer/block/[round]/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getBlockDetails } from '@/app/actions/explorerActions';
import type { BlockData, TransactionData, Network } from '@/types/explorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, BoxIcon, ExternalLink, ArrowRightLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


function BlockDetailsDisplay({ block, network }: { block: BlockData; network: Network }) {
  const router = useRouter();
  const ITEMS_PER_PAGE = 10;
  const [currentTxPage, setCurrentTxPage] = useState(1);

  const paginatedTransactions = block.transactions?.slice((currentTxPage - 1) * ITEMS_PER_PAGE, currentTxPage * ITEMS_PER_PAGE) || [];
  const totalTxPages = Math.ceil((block.transactions?.length || 0) / ITEMS_PER_PAGE);

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void, type: string) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} size="sm" variant="outline">Previous</Button>
        <span className="text-sm">Page {currentPage} of {totalPages} ({type})</span>
        <Button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} size="sm" variant="outline">Next</Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BoxIcon className="h-7 w-7 text-primary" />
              Block Details
            </CardTitle>
            <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="text-sm">
              {network.toUpperCase()}
            </Badge>
          </div>
          <CardDescription className="font-mono text-sm pt-1">Round: {block.round.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><strong className="text-primary">Timestamp:</strong> {new Date(block.timestamp * 1000).toLocaleString()} ({formatDistanceToNow(new Date(block.timestamp * 1000), { addSuffix: true })})</div>
          <div><strong className="text-primary">Transactions:</strong> {block.transactionCount.toLocaleString()}</div>
          <div><strong className="text-primary">Proposer:</strong> <Link href={`/explorer/account/${block.proposer}?network=${network}`} className="font-mono hover:underline break-all">{block.proposer}</Link></div>
          <div className="md:col-span-2"><strong className="text-primary">Block Hash:</strong> <span className="font-mono break-all text-xs">{block.blockHash}</span></div>
          {block.rewards && (
            <div className="md:col-span-2 mt-2 pt-3 border-t">
              <h4 className="text-md font-semibold text-primary mb-1">Rewards:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {block.rewards['fee-sink'] && <p><strong>Fee Sink:</strong> <Link href={`/explorer/account/${block.rewards['fee-sink']}?network=${network}`} className="font-mono hover:underline break-all">{block.rewards['fee-sink']}</Link></p>}
                {block.rewards['rewards-calculation-round'] !== undefined && <p><strong>Rewards Calculation Round:</strong> {block.rewards['rewards-calculation-round']?.toLocaleString()}</p>}
                {block.rewards['rewards-level'] !== undefined && <p><strong>Rewards Level:</strong> {block.rewards['rewards-level']?.toLocaleString()}</p>}
                {block.rewards['rewards-pool'] && <p><strong>Rewards Pool:</strong> <Link href={`/explorer/account/${block.rewards['rewards-pool']}?network=${network}`} className="font-mono hover:underline break-all">{block.rewards['rewards-pool']}</Link></p>}
                {block.rewards['rewards-rate'] !== undefined && <p><strong>Rewards Rate:</strong> {block.rewards['rewards-rate']?.toLocaleString()}</p>}
                {block.rewards['rewards-residue'] !== undefined && <p><strong>Rewards Residue:</strong> {block.rewards['rewards-residue']?.toLocaleString()}</p>}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
          <Button variant="outline" size="sm" asChild>
            <a href={`https://app.dappflow.org/explorer/block/${block.round}/${network === 'testnet' ? 'testnet' : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              View on DappFlow <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      {block.transactions && block.transactions.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary" />Transactions in this Block ({block.transactions.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>TxID</TableHead><TableHead>Type</TableHead><TableHead>Sender</TableHead><TableHead>Receiver</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell><Link href={`/explorer/tx/${tx.id}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.id}</Link></TableCell>
                    <TableCell><Badge variant="outline">{tx.type.toUpperCase()}</Badge></TableCell>
                    <TableCell><Link href={`/explorer/account/${tx.sender}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.sender}</Link></TableCell>
                    <TableCell>{tx.receiver ? <Link href={`/explorer/account/${tx.receiver}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.receiver}</Link> : 'N/A'}</TableCell>
                    <TableCell className="text-xs">
                      {tx.type === 'pay' && tx.amount !== undefined ? `${tx.amount.toLocaleString()} ALGO` :
                        tx.type === 'axfer' && tx.assetAmount !== undefined && tx.assetId ? `${tx.assetAmount.toLocaleString()} (Asset ${tx.assetId})` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentTxPage, totalTxPages, setCurrentTxPage, 'Transactions')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function BlockPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const [blockDetails, setBlockDetails] = useState<BlockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roundParam = params.round as string;
  const round = parseInt(roundParam, 10);
  const network = (searchParamsHook.get('network') as Network) || 'mainnet';

  useEffect(() => {
    if (roundParam && !isNaN(round)) {
      setIsLoading(true);
      setError(null);
      getBlockDetails(round, network)
        .then(data => {
          if (data) {
            setBlockDetails(data);
          } else {
            setError('Block not found or failed to load details.');
          }
        })
        .catch(err => {
          console.error("Error fetching block details:", err);
          setError(err.message || 'An unexpected error occurred.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setError('Invalid Block Round.');
      setIsLoading(false);
    }
  }, [roundParam, round, network]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading block details for round: <span className="font-mono">{roundParam}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Block</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!blockDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Block Not Found</h2>
        <p className="text-muted-foreground mb-6">Block round <span className="font-mono">{roundParam}</span> could not be found on {network}.</p>
        <Button onClick={() => router.push('/explorer')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading...</div>}>
      <div className="space-y-8">
        <Button onClick={() => router.push('/explorer')} variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer Search
        </Button>
        <BlockDetailsDisplay block={blockDetails} network={network} />
      </div>
    </Suspense>
  );
}
