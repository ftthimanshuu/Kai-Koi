import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-border/60 bg-card/70 backdrop-blur-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to Kai Koi</CardTitle>
          <CardDescription>
            Authentication route initialized. Full Firebase Auth integration (Email/Password + Google Sign-In) is scheduled for <strong>Phase 1</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-4 rounded-xl bg-muted/50 border border-border/40 text-xs text-muted-foreground leading-relaxed">
            Routes, state stores, and the Axios token interceptor are configured and ready to connect Firebase Auth in the next phase.
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 pt-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
