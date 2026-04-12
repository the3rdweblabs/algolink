
// src/components/explorer/NftCard.tsx
'use client';

import BlockchainImage from '@/components/ui/BlockchainImage';
import Link from 'next/link';
import type { NftData } from '@/types/explorer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, CircleUser } from 'lucide-react'; 
import { Badge } from '@/components/ui/badge'; 

interface NftCardProps {
  nft: NftData;
  isRelated?: boolean; 
}

export default function NftCard({ nft, isRelated }: NftCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-white/5 bg-neutral-900/40 backdrop-blur-sm">
      <CardHeader className="p-0 relative">
        <Link href={`/explorer/asset/${nft.id}?network=${nft.network}`} className="block aspect-square w-full relative hover:opacity-80 transition-opacity">
          <BlockchainImage
            src={nft.imageUrl || "https://placehold.co/300x300.png?text=NFT"}
            alt={nft.name}
            className="object-cover"
          />
        </Link>
        <Badge 
          variant="outline" 
          className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 ${nft.network === 'mainnet' ? 'border-blue-500 text-blue-600 bg-blue-500/10' : 'border-orange-500 text-orange-600 bg-orange-500/10'}`}
        >
          {nft.network.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Link href={`/explorer/asset/${nft.id}?network=${nft.network}`} className="hover:underline">
          <CardTitle className="text-lg font-semibold truncate flex items-center" title={nft.name}>
            {nft.name}
            {isRelated && <Badge variant="outline" className="ml-1.5 text-xs border-amber-500 text-amber-600 bg-amber-500/5 shrink-0">Related</Badge>}
          </CardTitle>
        </Link>
        {nft.collectionName && nft.collectionName !== 'N/A' && (
          <CardDescription className="text-sm text-muted-foreground truncate">
            Collection: {nft.collectionName}
          </CardDescription>
        )}
        <p className="text-xs text-muted-foreground break-all">
          Asset ID: <Link href={`/explorer/asset/${nft.id}?network=${nft.network}`} className="font-mono hover:underline">{nft.id}</Link>
        </p>
        {nft.creatorAddress && (
             <p className="text-xs text-muted-foreground break-all truncate flex items-center gap-1" title={nft.creatorAddress}>
                <CircleUser className="h-3 w-3 text-primary/80" /> Creator: <Link href={`/explorer/account/${nft.creatorAddress}?network=${nft.network}`} className="font-mono hover:underline">{nft.creatorAddress.substring(0,8)}...{nft.creatorAddress.substring(nft.creatorAddress.length - 4)}</Link>
            </p>
        )}
        {nft.ownerAddress && nft.ownerAddress !== nft.creatorAddress && (
             <p className="text-xs text-muted-foreground break-all truncate flex items-center gap-1" title={nft.ownerAddress}>
                <Crown className="h-3 w-3 text-amber-500" /> Owner: <Link href={`/explorer/account/${nft.ownerAddress}?network=${nft.network}`} className="font-mono hover:underline">{nft.ownerAddress.substring(0,8)}...{nft.ownerAddress.substring(nft.ownerAddress.length - 4)}</Link>
            </p>
        )}
        {nft.description && (
          <p className="text-sm text-foreground/80 line-clamp-2" title={nft.description}>
            {nft.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

    