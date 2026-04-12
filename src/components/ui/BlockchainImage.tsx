// src/components/ui/BlockchainImage.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface BlockchainImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export default function BlockchainImage({
  src,
  alt,
  className,
  containerClassName,
}: BlockchainImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Ensure IPFS strings are correctly handled if they aren't already prefixed
    let finalSrc = src;
    if (src.startsWith('ipfs://')) {
      const cid = src.substring(7);
      // Use Nodely as primary source
      const hasExtension = cid.includes('.');
      finalSrc = `https://ipfs.algonode.xyz/ipfs/${cid}${hasExtension ? '' : '?optimizer=image'}`;
    }

    setResolvedSrc(finalSrc);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className={cn("relative overflow-hidden w-full h-full bg-neutral-900/50 flex items-center justify-center", containerClassName)}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800 flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full bg-neutral-700/50" />
        </div>
      )}

      {/* Error Fallback */}
      {error ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
          <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs font-medium max-w-[120px] truncate">{alt}</p>
          <p className="text-[10px] opacity-70">Image unavailable</p>
        </div>
      ) : (
        resolvedSrc && (
          <img
            src={resolvedSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
            loading="lazy"
          />
        )
      )}

      {!src && !isLoading && (
        <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
          <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-xs">No image provided</p>
        </div>
      )}
    </div>
  );
}
