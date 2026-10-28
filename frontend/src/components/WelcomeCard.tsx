import { cn } from '@/lib/utils';
import { Film, Sparkles, Utensils, CheckCircle2 } from 'lucide-react';

interface WelcomeCardProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function WelcomeCard({ title, subtitle, className }: WelcomeCardProps) {
  return (
    <div
      className={cn(
        'max-w-xl w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200 dark:shadow-none">
            KK
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Entertainment Hub & Unified Booking Engine
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Step 0.2 Ready
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {subtitle}
      </p>

      {/* The 3 Kai Koi Verticals preview */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
          <Film className="h-5 w-5 text-indigo-500 mb-1.5" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Cinema</span>
          <span className="text-[10px] text-slate-400">Seats & Screens</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
          <Sparkles className="h-5 w-5 text-amber-500 mb-1.5" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Live Shows</span>
          <span className="text-[10px] text-slate-400">Auditorium</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
          <Utensils className="h-5 w-5 text-rose-500 mb-1.5" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Dining</span>
          <span className="text-[10px] text-slate-400">Tables & Slots</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-100/70 px-4 py-2.5 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
        <span className="font-mono">Tailwind CSS v4 + Utility primitives configured</span>
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">v0.1.0</span>
      </div>
    </div>
  );
}
