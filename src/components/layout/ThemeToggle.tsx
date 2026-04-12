// src/components/layout/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to avoid hydration mismatch,
    // or a skeleton loader if you prefer
    return <Skeleton className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background hover:bg-accent hover:text-accent-foreground"
      onClick={() => setTheme(theme === 'dark' || theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-6 w-6" />
      ) : (
        <Moon className="h-6 w-6" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
