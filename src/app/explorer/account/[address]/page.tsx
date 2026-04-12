
// src/app/explorer/account/[address]/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getAccountDetails } from '@/app/actions/explorerActions';
import type { AccountData, TransactionData, AssetHolding, ApplicationData, Network } from '@/types/explorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, UserCircle, Package, Terminal, ArrowRightLeft, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';


function AccountDetailsDisplay({ account, network }: { account: AccountData; network: Network }) {
    const router = useRouter();
    const ITEMS_PER_PAGE = 5;
    const [currentTxPage, setCurrentTxPage] = useState(1);
    const [currentAssetPage, setCurrentAssetPage] = useState(1);
    const [currentCreatedAppPage, setCurrentCreatedAppPage] = useState(1);

    const paginatedTransactions = account.transactions?.slice((currentTxPage - 1) * ITEMS_PER_PAGE, currentTxPage * ITEMS_PER_PAGE) || [];
    const paginatedAssets = account.assets?.slice((currentAssetPage - 1) * ITEMS_PER_PAGE, currentAssetPage * ITEMS_PER_PAGE) || [];
    const paginatedCreatedApps = account.createdApps?.slice((currentCreatedAppPage - 1) * ITEMS_PER_PAGE, currentCreatedAppPage * ITEMS_PER_PAGE) || [];

    const totalTxPages = Math.ceil((account.transactions?.length || 0) / ITEMS_PER_PAGE);
    const totalAssetPages = Math.ceil((account.assets?.length || 0) / ITEMS_PER_PAGE);
    const totalCreatedAppPages = Math.ceil((account.createdApps?.length || 0) / ITEMS_PER_PAGE);

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
              <UserCircle className="h-7 w-7 text-primary" />
              Account Details
            </CardTitle>
            <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="text-sm">
              {network.toUpperCase()}
            </Badge>
          </div>
          <CardDescription className="break-all font-mono text-sm pt-1">{account.address}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm overflow-hidden">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-primary font-semibold uppercase text-[10px] tracking-wider">Balance</span>
            <span className="text-lg font-mono break-all">{account.balance.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-primary font-semibold uppercase text-[10px] tracking-wider">Min Balance</span>
            <span className="text-lg font-mono break-all">{account.minBalance?.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</span>
          </div>
          {account.authAddr && (
            <div className="flex flex-col gap-1 md:col-span-2 min-w-0">
              <span className="text-primary font-semibold uppercase text-[10px] tracking-wider">Auth Addr</span>
              <Link href={`/explorer/account/${account.authAddr}?network=${network}`} className="font-mono hover:underline break-all text-xs text-muted-foreground">{account.authAddr}</Link>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-primary font-semibold uppercase text-[10px] tracking-wider">Total Assets</span>
            <span className="text-lg font-mono">{account.totalAssets?.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-primary font-semibold uppercase text-[10px] tracking-wider">Apps Created</span>
            <span className="text-lg font-mono">{account.totalCreatedApps?.toLocaleString()}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
            <Button variant="outline" size="sm" asChild>
                <a href={`https://app.dappflow.org/explorer/account/${account.address}/${network === 'testnet' ? 'testnet' : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    View on DappFlow <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </Button>
        </CardFooter>
      </Card>

      {account.assets && account.assets.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary"/>Assets Held ({account.assets.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Asset ID</TableHead><TableHead>Name</TableHead><TableHead>Unit Name</TableHead><TableHead>Amount</TableHead><TableHead>Frozen</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedAssets.map(asset => (
                  <TableRow key={asset.assetId}>
                    <TableCell><Link href={`/explorer/asset/${asset.assetId}?network=${network}`} className="font-mono hover:underline">{asset.assetId}</Link></TableCell>
                    <TableCell>{asset.name || 'N/A'}</TableCell>
                    <TableCell>{asset.unitName || 'N/A'}</TableCell>
                    <TableCell>{(asset.amount / Math.pow(10, asset.decimals || 0)).toLocaleString(undefined, {maximumFractionDigits: asset.decimals || 0})}</TableCell>
                    <TableCell>{asset.isFrozen ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentAssetPage, totalAssetPages, setCurrentAssetPage, 'Assets')}
          </CardContent>
        </Card>
      )}

      {account.transactions && account.transactions.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary"/>Recent Transactions ({account.transactions.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>TxID</TableHead><TableHead>Type</TableHead><TableHead>Sender</TableHead><TableHead>Receiver</TableHead><TableHead>Amount</TableHead><TableHead>Age</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell><Link href={`/explorer/tx/${tx.id}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.id}</Link></TableCell>
                    <TableCell><Badge variant="outline">{tx.type.toUpperCase()}</Badge></TableCell>
                    <TableCell><Link href={`/explorer/account/${tx.sender}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.sender}</Link></TableCell>
                    <TableCell>{tx.receiver ? <Link href={`/explorer/account/${tx.receiver}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.receiver}</Link> : 'N/A'}</TableCell>
                    <TableCell>
                        {tx.type === 'pay' && tx.amount !== undefined ? `${tx.amount.toLocaleString()} ALGO` : 
                         tx.type === 'axfer' && tx.assetAmount !== undefined && tx.assetId ? `${tx.assetAmount.toLocaleString()} (Asset ${tx.assetId})` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs">{tx.roundTime ? formatDistanceToNow(new Date(tx.roundTime * 1000), { addSuffix: true }) : 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentTxPage, totalTxPages, setCurrentTxPage, 'Transactions')}
          </CardContent>
        </Card>
      )}

      {account.createdApps && account.createdApps.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Terminal className="h-6 w-6 text-primary"/>Created Applications ({account.createdApps.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>App ID</TableHead><TableHead>Approval Pgm (bytes)</TableHead><TableHead>Clear Pgm (bytes)</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedCreatedApps.map(app => (
                  <TableRow key={app.id}>
                    <TableCell><Link href={`/explorer/app/${app.id}?network=${network}`} className="font-mono hover:underline">{app.id}</Link></TableCell>
                    <TableCell>{app.approvalProgram.length}</TableCell>
                    <TableCell>{app.clearStateProgram.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentCreatedAppPage, totalCreatedAppPages, setCurrentCreatedAppPage, 'Created Apps')}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function AccountPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const [accountDetails, setAccountDetails] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const address = params.address as string;
  const network = (searchParamsHook.get('network') as Network) || 'mainnet';


  useEffect(() => {
    if (address) {
      setIsLoading(true);
      setError(null);
      getAccountDetails(address, network)
        .then(data => {
          if (data) {
            setAccountDetails(data);
          } else {
            setError('Account not found or failed to load details.');
          }
        })
        .catch(err => {
          console.error("Error fetching account details:", err);
          setError(err.message || 'An unexpected error occurred.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [address, network]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading account details for <span className="font-mono">{address}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Account</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-6">The account <span className="font-mono">{address}</span> could not be found on {network}.</p>
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
        <AccountDetailsDisplay account={accountDetails} network={network} />
      </div>
    </Suspense>
  );
}
