// src/components/layout/RocketBadge.tsx
import Link from 'next/link';
import { ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RocketBadge() {
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2",
        // Positioned to the right edge of the parent's left side, then pushed further left with margin
        "right-full top-1/2 -translate-y-1/2 mr-10" 
      )}
    >
      <div className="bg-yellow-400 text-black p-1.5 rounded-lg shadow-md shrink-0">
        <ChevronsRight className="h-5 w-5" />
      </div>
      <div className="text-sm font-semibold text-foreground">
        {/* Text for larger screens (single line) */}
        <p className="hidden sm:block sm:whitespace-nowrap">
          Built for the <Link href="https://algorand.co/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Algorand</Link> community
        </p>
        {/* Text for smaller screens (two lines with <br />) */}
        <p className="block sm:hidden">
          Built for the <br />
          <Link href="https://algorand.co/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Algorand</Link> community
        </p>
      </div>
    </div>
  );
}
