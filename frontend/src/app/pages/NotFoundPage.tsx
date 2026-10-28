import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6" size="sm">
        <Link to="/">Return to Kai Koi Home</Link>
      </Button>
    </div>
  );
}
