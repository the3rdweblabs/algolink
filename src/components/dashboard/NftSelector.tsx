'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { getUserNfts } from '@/app/actions/profileActions';
import type { NftData } from '@/types/explorer';
import Image from 'next/image';

interface NftSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
}

export default function NftSelector({ isOpen, onClose, onSelect }: NftSelectorProps) {
  const [nfts, setNfts] = useState<NftData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNfts();
    }
  }, [isOpen]);

  const loadNfts = async () => {
    setIsLoading(true);
    try {
      const data = await getUserNfts();
      setNfts(data as NftData[]);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-neutral-950 border-white/10 max-h-[85vh] overflow-hidden flex flex-col p-6 shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              <Sparkles className="h-6 w-6 text-primary" />
              Your NFT Collection
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={loadNfts} disabled={isLoading} className="h-8 w-8 text-muted-foreground hover:text-white">
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground">
            Select an NFT from your linked wallets to use as your professional blockchain identity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
            {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground py-20">
                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="animate-pulse font-medium">Scanning wallets for assets...</p>
            </div>
            ) : nfts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                {nfts.map((nft) => (
                <button
                    key={`${nft.network}-${nft.id}`}
                    onClick={() => {
                    onSelect(nft.imageUrl);
                    onClose();
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-neutral-900 hover:border-primary/50 hover:ring-2 hover:ring-primary/20 transition-all group shadow-lg"
                >
                    <Image
                    src={nft.imageUrl}
                    alt={nft.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <p className="text-white text-[10px] font-bold truncate leading-tight">{nft.name}</p>
                        <p className="text-primary/70 text-[8px] font-semibold uppercase tracking-tighter">ID: {nft.id}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${
                            nft.network === 'mainnet' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-neutral-600 text-white'
                        }`}>
                            {nft.network}
                        </div>
                    </div>
                </button>
                ))}
            </div>
            ) : (
            <div className="h-full py-16 flex flex-col items-center justify-center gap-6 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground shadow-inner">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                </div>
                <div className="space-y-2 px-10">
                    <p className="font-bold text-lg text-white">No NFTs Found</p>
                    <p className="text-sm text-muted-foreground">
                        We scanned all your linked wallets but couldn&apos;t find any NFTs. 
                        Make sure you have assets with a total supply of 1 and 0 decimals.
                    </p>
                    <div className="pt-4">
                        <Button variant="outline" size="sm" onClick={loadNfts} className="rounded-full">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
