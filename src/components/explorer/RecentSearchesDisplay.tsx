// src/components/explorer/RecentSearchesDisplay.tsx
'use client';

import { ListRestart, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentSearchesDisplayProps {
  searches: string[];
  onSearch: (query: string) => void;
  onClear: () => void;
}

export default function RecentSearchesDisplay({ searches, onSearch, onClear }: RecentSearchesDisplayProps) {
  if (searches.length === 0) {
    return null; 
  }

  return (
    <Card className="shadow-md rounded-xl mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <ListRestart className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Recent Searches</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear} title="Clear recent searches">
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </CardHeader>
      <CardContent>
        {searches.length > 0 ? (
          <ul className="space-y-2">
            {searches.map((query) => (
              <li key={query}> {/* Changed key from index to query */}
                <Button
                  variant="link"
                  className="p-0 h-auto text-base text-muted-foreground hover:text-primary justify-start"
                  onClick={() => onSearch(query)}
                  title={`Search for ${query}`}
                >
                    <Search className="h-4 w-4 mr-2 opacity-70"/>
                    <span className="font-mono break-all">{query}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No recent searches yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
