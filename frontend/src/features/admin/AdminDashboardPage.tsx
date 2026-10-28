import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft, LayoutDashboard } from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Operations Console</h1>
            <p className="text-xs text-muted-foreground">Kai Koi management dashboard and venue scheduling</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Public View
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Admin Route Connected
          </div>
          <CardTitle>Management Subsystem (Phase 2)</CardTitle>
          <CardDescription>
            This area will house venue layouts, seating grids, dining slots, session scheduling, and check-in management as planned in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground">
            Role-gated route guards (`STAFF` & `ADMIN`) will secure this route automatically once Phase 1 authentication is activated.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
