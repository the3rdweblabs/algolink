
// src/app/explorer/app/[appId]/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getApplicationDetails } from '@/app/actions/explorerActions';
import type { ApplicationData, TransactionData, Network } from '@/types/explorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, TerminalSquare, ExternalLink, EyeIcon, EyeOffIcon, ArrowRightLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';


function ApplicationDetailsDisplay({ app, network }: { app: ApplicationData; network: Network }) {
  const router = useRouter();
  const [showRawApproval, setShowRawApproval] = useState(false);
  const [showRawClear, setShowRawClear] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const [currentTxPage, setCurrentTxPage] = useState(1);

  const paginatedTransactions = app.transactions?.slice((currentTxPage - 1) * ITEMS_PER_PAGE, currentTxPage * ITEMS_PER_PAGE) || [];
  const totalTxPages = Math.ceil((app.transactions?.length || 0) / ITEMS_PER_PAGE);

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
                    <TerminalSquare className="h-7 w-7 text-primary" />
                    Application Details
                </CardTitle>
                <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="text-sm">
                    {network.toUpperCase()}
                </Badge>
            </div>
          <CardDescription className="font-mono text-sm pt-1">App ID: {app.id}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><strong className="text-primary">Creator:</strong> <Link href={`/explorer/account/${app.creator}?network=${network}`} className="font-mono hover:underline break-all">{app.creator}</Link></div>
          {app.globalStateSchema && <div><strong className="text-primary">Global Schema:</strong> {app.globalStateSchema.numUint} Uint, {app.globalStateSchema.numByteSlice} ByteSlice</div>}
          {app.localStateSchema && <div><strong className="text-primary">Local Schema:</strong> {app.localStateSchema.numUint} Uint, {app.localStateSchema.numByteSlice} ByteSlice</div>}
          {app.extraProgramPages !== undefined && <div><strong className="text-primary">Extra Pages:</strong> {app.extraProgramPages}</div>}

          <div className="md:col-span-2 mt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="approval-program">
                <AccordionTrigger className="text-base font-semibold">Approval Program (TEAL)</AccordionTrigger>
                <AccordionContent>
                  <Button variant="outline" size="sm" onClick={() => setShowRawApproval(!showRawApproval)} className="mb-2 text-xs">
                    {showRawApproval ? <EyeOffIcon className="mr-1.5 h-3.5 w-3.5"/> : <EyeIcon className="mr-1.5 h-3.5 w-3.5"/>}
                    {showRawApproval ? 'Hide Raw' : 'Show Raw'}
                  </Button>
                  <pre className={`p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto ${!showRawApproval ? 'max-h-24 blur-sm select-none' : 'max-h-96'}`}>
                    {Buffer.from(app.approvalProgram, 'base64').toString('utf-8')}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="clear-state-program">
                <AccordionTrigger className="text-base font-semibold">Clear State Program (TEAL)</AccordionTrigger>
                <AccordionContent>
                   <Button variant="outline" size="sm" onClick={() => setShowRawClear(!showRawClear)} className="mb-2 text-xs">
                    {showRawClear ? <EyeOffIcon className="mr-1.5 h-3.5 w-3.5"/> : <EyeIcon className="mr-1.5 h-3.5 w-3.5"/>}
                    {showRawClear ? 'Hide Raw' : 'Show Raw'}
                  </Button>
                  <pre className={`p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto ${!showRawClear ? 'max-h-24 blur-sm select-none' : 'max-h-96'}`}>
                    {Buffer.from(app.clearStateProgram, 'base64').toString('utf-8')}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              {app.globalState && app.globalState.length > 0 && (
                <AccordionItem value="global-state">
                  <AccordionTrigger className="text-base font-semibold">Global State ({app.globalState.length})</AccordionTrigger>
                  <AccordionContent className="max-h-60 overflow-y-auto text-xs">
                    {app.globalState.map(item => (
                      <div key={item.key} className="mb-1.5 p-1.5 bg-muted/50 rounded font-mono">
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
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
             <Button variant="outline" size="sm" asChild>
                 <a href={`https://app.dappflow.org/explorer/application/${app.id}/${network === 'testnet' ? 'testnet' : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    View on DappFlow <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </Button>
        </CardFooter>
      </Card>

      {app.transactions && app.transactions.length > 0 && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary"/>Recent Transactions ({app.transactions.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>TxID</TableHead><TableHead>Type</TableHead><TableHead>Sender</TableHead><TableHead>Age</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell><Link href={`/explorer/tx/${tx.id}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.id}</Link></TableCell>
                    <TableCell><Badge variant="outline">{tx.type.toUpperCase()}</Badge></TableCell>
                    <TableCell><Link href={`/explorer/account/${tx.sender}?network=${network}`} className="font-mono hover:underline truncate block max-w-[100px]">{tx.sender}</Link></TableCell>
                    <TableCell className="text-xs">{tx.roundTime ? formatDistanceToNow(new Date(tx.roundTime * 1000), { addSuffix: true }) : 'Pending'}</TableCell>
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


export default function ApplicationPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const [applicationDetails, setApplicationDetails] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const appIdParam = params.appId as string;
  const appId = parseInt(appIdParam, 10);
  const network = (searchParamsHook.get('network') as Network) || 'mainnet';

  useEffect(() => {
    if (appIdParam && !isNaN(appId)) {
      setIsLoading(true);
      setError(null);
      getApplicationDetails(appId, network)
        .then(data => {
          if (data) {
            setApplicationDetails(data);
          } else {
            setError('Application not found or failed to load details.');
          }
        })
        .catch(err => {
          console.error("Error fetching application details:", err);
          setError(err.message || 'An unexpected error occurred.');
        })
        .finally(() => setIsLoading(false));
    } else {
        setError('Invalid Application ID.');
        setIsLoading(false);
    }
  }, [appIdParam, appId, network]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading application details for ID: <span className="font-mono">{appIdParam}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Application</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!applicationDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Application Not Found</h2>
        <p className="text-muted-foreground mb-6">Application ID <span className="font-mono">{appIdParam}</span> could not be found on {network}.</p>
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
        <ApplicationDetailsDisplay app={applicationDetails} network={network} />
      </div>
    </Suspense>
  );
}
