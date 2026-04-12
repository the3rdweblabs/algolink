
// src/components/explorer/StatCard.tsx
import type React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
  isLoading: boolean;
  isError?: boolean;
  unit?: string;
  tooltip?: string;
  isMocked?: boolean;
}

export default function StatCard({ title, value, icon: Icon, isLoading, isError, unit, tooltip, isMocked }: StatCardProps) {
  let displayValue: string | number = 'N/A';
  if (value !== null && value !== undefined) {
    if (typeof value === 'number') {
      displayValue = value.toLocaleString(undefined, {
        minimumFractionDigits: unit === '$' && value < 1 && value !== 0 ? 4 : (unit === '$' ? 2 : 0),
        maximumFractionDigits: unit === '$' ? (value < 1 && value !== 0 ? 4 : 2) : (Number.isInteger(value) ? 0 : (typeof value === 'number' && !Number.isInteger(value) ? 2 : 0)),
      });
    } else {
      displayValue = value; // For string values like percentages or "25.6M"
    }
  }

  const cardRootClasses = "min-w-0 flex-1"; // Classes applied to the root of the StatCard for flex behavior

  const cardContent = (
    <div className="p-3 sm:p-4 rounded-lg bg-card/50 dark:bg-card/30 shadow min-h-[80px] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap truncate">{title}</h3>
        <Icon className="h-4 w-4 text-primary flex-shrink-0 ml-1" />
      </div>
      <div className="mt-auto pt-1">
        {isLoading && !isMocked ? ( 
          <Skeleton className="h-6 w-3/4 rounded" />
        ) : isError ? (
           <span className="text-xs sm:text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Error</span>
        ) : (
          <p className="text-base sm:text-lg font-semibold text-foreground truncate" title={String(displayValue)}>
            {unit === '$' && value !== null && value !== undefined && <span className="text-xs mr-0.5">{unit}</span>}
            {displayValue}
            {unit && value !== null && value !== undefined && unit !== '$' && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
            {isMocked && <span className="text-xs text-muted-foreground/70 ml-1">(Mocked)</span>}
          </p>
        )}
      </div>
    </div>
  );

  if (tooltip) {
     return <div title={tooltip} className={cardRootClasses}>{cardContent}</div>;
  }
  return <div className={cardRootClasses}>{cardContent}</div>;
}
