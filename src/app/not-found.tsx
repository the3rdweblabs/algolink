// src/app/not-found.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist on AlgoLink.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-3xl font-bold text-destructive">404 - Page Not Found</CardTitle>
          <CardDescription className="mt-2 text-lg">
            Oops! The page you're looking for doesn't seem to exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            It might have been moved, deleted, or maybe you just mistyped the URL.
            Let's get you back on track.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
