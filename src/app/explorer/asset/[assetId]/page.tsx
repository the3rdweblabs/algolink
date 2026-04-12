// src/app/explorer/asset/[assetId]/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getAssetDetails } from '@/app/actions/explorerActions';
import type { NftData, Network, AssetParams } from '@/types/explorer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import BlockchainImage from '@/components/ui/BlockchainImage';
import Image from 'next/image';
import { ArrowLeft, Loader2, AlertTriangle, PackageIcon, ExternalLink, UserCircle, Copy, Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function DetailRow({ label, value, href, isMono = false }: { label: string; value?: string | number | null; href?: string; isMono?: boolean }) {
  if (!value) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-3 border-b border-white/10 gap-2 sm:gap-6 overflow-hidden">
      <dt className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider font-semibold">{label}</dt>
      <dd className={cn(
        "text-sm text-white break-all text-left sm:text-right w-full sm:max-w-[70%]", 
        isMono && 'font-mono text-[11px] sm:text-[13px] opacity-80'
      )}>
        {href ? (
          <Link href={href} className="hover:underline text-primary">
            {value}
          </Link>
        ) : (
          <span>{value}</span>
        )}
      </dd>
    </div>
  );
}


function AssetDetailsDisplay({ asset, network }: { asset: NftData; network: Network }) {
  const router = useRouter();
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast({ title: 'Copied!', description: 'Asset ID copied to clipboard.' });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  return (
    <div className="bg-neutral-900 border border-white/5 text-white p-4 sm:p-8 rounded-xl min-h-[calc(100vh-250px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Image */}
            <div className="relative w-full aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                <BlockchainImage
                    src={asset.imageUrl || "https://placehold.co/600x600.png?text=Asset"}
                    alt={asset.name}
                    className="object-cover"
                />
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <Badge variant={network === 'mainnet' ? 'default' : 'secondary'} className="text-sm">
                        {network.toUpperCase()}
                    </Badge>
                     <Button variant="outline" size="sm" asChild>
                        <a href={`https://app.dappflow.org/explorer/asset/${asset.id}/${network === 'testnet' ? 'testnet' : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-transparent hover:bg-white/10 border-white/20">
                            View on DappFlow <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-bold mb-4 break-all leading-tight">{asset.name}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm text-muted-foreground font-mono">
                        Asset ID: {asset.id}
                    </p>
                    <Button onClick={() => handleCopy(asset.id)} size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-white">
                        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy Asset ID</span>
                    </Button>
                    <Badge variant="outline" className="border-white/20">ARC69</Badge>
                </div>

                <div className="space-y-1 my-4">
                  <DetailRow label="Owner" value={asset.ownerAddress} href={asset.ownerAddress ? `/explorer/account/${asset.ownerAddress}?network=${network}`: undefined} isMono />
                  <DetailRow label="Creator" value={asset.creatorAddress} href={asset.creatorAddress ? `/explorer/account/${asset.creatorAddress}?network=${network}` : undefined} isMono />
                  <DetailRow label="Collection" value={asset.collectionName !== 'N/A' ? asset.collectionName : undefined} />
                  <DetailRow label="Unit Name" value={asset.params?.unitName} isMono />
                  <DetailRow label="Total Supply" value={asset.params?.total?.toLocaleString()} />
                  <DetailRow label="Decimals" value={asset.params?.decimals} />
                </div>

                 {asset.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <h2 className="font-semibold text-lg mb-2">Description</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{asset.description}</p>
                    </div>
                )}
                
                {asset.params && (
                  <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="asset-params" className="border-b-0">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline bg-white/5 px-4 rounded-md">
                          Show More
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 text-xs space-y-1">
                          <DetailRow label="Manager" value={asset.params.manager} href={asset.params.manager ? `/explorer/account/${asset.params.manager}?network=${network}` : undefined} isMono />
                          <DetailRow label="Reserve" value={asset.params.reserve} href={asset.params.reserve ? `/explorer/account/${asset.params.reserve}?network=${network}`: undefined} isMono />
                          <DetailRow label="Freeze" value={asset.params.freeze} href={asset.params.freeze ? `/explorer/account/${asset.params.freeze}?network=${network}`: undefined} isMono />
                          <DetailRow label="Clawback" value={asset.params.clawback} href={asset.params.clawback ? `/explorer/account/${asset.params.clawback}?network=${network}`: undefined} isMono />
                          {asset.params.url && 
                              <div className="flex justify-between items-center py-3">
                                  <dt className="text-sm text-muted-foreground">URL</dt>
                                  <dd className="text-sm text-right text-foreground">
                                      <a href={asset.params.url.startsWith('http') ? asset.params.url : `//${asset.params.url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{asset.params.url}</a>
                                  </dd>
                              </div>
                          }
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
            </div>
        </div>
    </div>
  );
}

export default function AssetPage() {
  const params = useParams();
  const searchParamsHook = useSearchParams();
  const router = useRouter();

  const [assetDetails, setAssetDetails] = useState<NftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const assetId = params.assetId as string;
  const network = (searchParamsHook.get('network') as Network) || 'mainnet';

  useEffect(() => {
    if (assetId) {
      setIsLoading(true);
      setError(null);
      getAssetDetails(assetId, network)
        .then(data => {
          if (data) {
            setAssetDetails(data);
          } else {
            setError('Asset not found or failed to load details.');
          }
        })
        .catch(err => {
          console.error("Error fetching asset details:", err);
          setError(err.message || 'An unexpected error occurred.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [assetId, network]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading asset details for ID: <span className="font-mono">{assetId}</span>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Asset</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!assetDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Asset Not Found</h2>
        <p className="text-muted-foreground mb-6">Asset ID <span className="font-mono">{assetId}</span> could not be found on {network}.</p>
        <Button onClick={() => router.push('/explorer')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer
        </Button>
      </div>
    );
  }
  
  return (
     <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading...</div>}>
       <div className="space-y-4">
        <Button onClick={() => router.push('/explorer')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer Search
        </Button>
        <AssetDetailsDisplay asset={assetDetails} network={network} />
      </div>
    </Suspense>
  );
}