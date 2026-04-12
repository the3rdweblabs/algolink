
// src/app/explorer/tx/[txid]/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getTransactionDetails } from '@/app/actions/explorerActions';
import type { TransactionData, Network } from '@/types/explorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function TransactionDetailsDisplay({ tx, network }: { tx: TransactionData; network: Network }) {
  const router = useRouter();

  const renderTxSpecificDetails = () => {
    if (!tx.txTypeSpecific) return null;
    const specifics = tx.txTypeSpecific;

    return (
      <div className="mt-4 space-y-3 pt-3 border-t">
        <h4 className="text-md font-semibold text-primary">Transaction Specifics:</h4>
        {specifics.payment && (
          <div className="text-xs space-y-1">
            <p><strong>Receiver:</strong> <Link href={`/explorer/account/${specifics.payment.receiver}?network=${network}`} className="font-mono hover:underline break-all">{specifics.payment.receiver}</Link></p>
            <p><strong>Amount:</strong> {specifics.payment.amount.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</p>
            {specifics.payment.closeRemainderTo && <p><strong>Close Remainder To:</strong> <Link href={`/explorer/account/${specifics.payment.closeRemainderTo}?network=${network}`} className="font-mono hover:underline break-all">{specifics.payment.closeRemainderTo}</Link></p>}
          </div>
        )}
        {specifics.assetTransfer && (
          <div className="text-xs space-y-1">
            <p><strong>Asset ID:</strong> <Link href={`/explorer/asset/${specifics.assetTransfer.assetId}?network=${network}`} className="font-mono hover:underline">{specifics.assetTransfer.assetId}</Link></p>
            <p><strong>Amount:</strong> {specifics.assetTransfer.amount.toLocaleString()}</p>
            <p><strong>Receiver:</strong> <Link href={`/explorer/account/${specifics.assetTransfer.receiver}?network=${network}`} className="font-mono hover:underline break-all">{specifics.assetTransfer.receiver}</Link></p>
            {specifics.assetTransfer.closeTo && <p><strong>Close To:</strong> <Link href={`/explorer/account/${specifics.assetTransfer.closeTo}?network=${network}`} className="font-mono hover:underline break-all">{specifics.assetTransfer.closeTo}</Link></p>}
          </div>
        )}
        {specifics.applicationCall && (
          <div className="text-xs space-y-1">
            <p><strong>Application ID:</strong> <Link href={`/explorer/app/${specifics.applicationCall.applicationId}?network=${network}`} className="font-mono hover:underline">{specifics.applicationCall.applicationId}</Link></p>
            <p><strong>On Completion:</strong> {specifics.applicationCall.onCompletion}</p>
            {specifics.applicationCall.applicationArgs && specifics.applicationCall.applicationArgs.length > 0 && (
              <div><strong>Args:</strong> {specifics.applicationCall.applicationArgs.map((arg,i) => <Badge key={i} variant="secondary" className="mr-1 font-mono text-xs">{arg || 'empty'}</Badge>)}</div>
            )}
             {specifics.applicationCall.accounts && specifics.applicationCall.accounts.length > 0 && (
              <div><strong>Accounts:</strong> {specifics.applicationCall.accounts.map((acc,i) => <Link key={acc + i} href={`/explorer/account/${acc}?network=${network}`} className="font-mono hover:underline break-all block text-xs">{acc}</Link>)}</div>
            )}
          </div>
        )}
        {specifics.assetConfig && (
            <div className="text-xs space-y-1">
                <p><strong>Asset ID:</strong> {specifics.assetConfig.assetId ? <Link href={`/explorer/asset/${specifics.assetConfig.assetId}?network=${network}`} className="font-mono hover:underline">{specifics.assetConfig.assetId}</Link> : '(New Asset)'}</p>
                {specifics.assetConfig.params && (
                    <ul className="list-disc pl-4">
                        {Object.entries(specifics.assetConfig.params).map(([key, value]) => value && (
                            <li key={key}><strong>{key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> <span className={['creator', 'manager', 'reserve', 'freeze', 'clawback'].includes(key) ? 'font-mono break-all' : ''}>{value.toString()}</span></li>
                        ))}
                    </ul>
                )}
            </div>
        )}
        {specifics.keyRegistration && (
             <div className="text-xs space-y-1">
                <p><strong>Vote PK:</strong> <span className="font-mono break-all">{specifics.keyRegistration.voteParticipationKey?.substring(0,20)}...</span></p>
                <p><strong>Selection PK:</strong> <span className="font-mono break-all">{specifics.keyRegistration.selectionParticipationKey?.substring(0,20)}...</span></p>
                <p><strong>Vote First Valid:</strong> {specifics.keyRegistration.voteFirstValid}</p>
                <p><strong>Vote Last Valid:</strong> {specifics.keyRegistration.voteLastValid}</p>
                <p><strong>Non-Participation:</strong> {specifics.keyRegistration.nonParticipation ? 'True' : 'False'}</p>
             </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-7 w-7 text-primary" />
                Transaction Details
            </CardTitle>
            <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="text-sm">
                {network.toUpperCase()}
            </Badge>
        </div>
        <CardDescription className="break-all font-mono text-sm pt-1">{tx.id}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div><strong className="text-primary">Type:</strong> <Badge variant="outline">{tx.type.toUpperCase()}</Badge></div>
        <div><strong className="text-primary">Sender:</strong> <Link href={`/explorer/account/${tx.sender}?network=${network}`} className="font-mono hover:underline break-all">{tx.sender}</Link></div>
        <div><strong className="text-primary">Fee:</strong> {tx.fee.toLocaleString(undefined, {maximumFractionDigits: 6})} ALGO</div>
        <div><strong className="text-primary">Confirmed Round:</strong> { tx.confirmedRound ? <Link href={`/explorer/block/${tx.confirmedRound}?network=${network}`} className="font-mono hover:underline">{tx.confirmedRound?.toLocaleString()}</Link> : "N/A" }</div>
        <div><strong className="text-primary">Timestamp:</strong> {new Date(tx.roundTime * 1000).toLocaleString()} ({formatDistanceToNow(new Date(tx.roundTime * 1000), { addSuffix: true })})</div>
        {tx.group && <div><strong className="text-primary">Group ID:</strong> <Link href={`/explorer?query=${tx.group}`} className="font-mono hover:underline break-all">{tx.group}</Link></div>}
        {tx.signature && <div><strong className="text-primary">Signature:</strong> <span className="font-mono break-all text-xs">{tx.signature.substring(0, 40)}...</span></div>}
        {tx.note && (
          <div className="md:col-span-2"><strong className="text-primary">Note:</strong> <pre className="inline-block p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap break-all">{tx.note}</pre></div>
        )}
        <div className="md:col-span-2">
          {renderTxSpecificDetails()}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <Button variant="outline" size="sm" asChild>
           <a href={`https://app.dappflow.org/explorer/transaction/${tx.id}/${network === 'testnet' ? 'testnet' : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                View on DappFlow <ExternalLink className="h-3.5 w-3.5" />
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TransactionPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const [transactionDetails, setTransactionDetails] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const txId = params.txid as string;
  const network = (searchParamsHook.get('network') as Network) || 'mainnet';

  useEffect(() => {
    if (txId) {
      setIsLoading(true);
      setError(null);
      getTransactionDetails(txId, network)
        .then(data => {
          if (data) {
            setTransactionDetails(data);
          } else {
            setError('Transaction not found or failed to load details.');
          }
        })
        .catch(err => {
          console.error("Error fetching transaction details:", err);
          setError(err.message || 'An unexpected error occurred.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [txId, network]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading transaction details for <span className="font-mono break-all">{txId}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Transaction</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Transaction Not Found</h2>
        <p className="text-muted-foreground mb-6">The transaction <span className="font-mono break-all">{txId}</span> could not be found on {network}.</p>
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
        <TransactionDetailsDisplay tx={transactionDetails} network={network} />
      </div>
    </Suspense>
  );
}
