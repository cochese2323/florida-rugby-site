import { Trophy, Shield } from 'lucide-react';

export function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 shadow-md ring-2 ring-gold-400/40">
        <Shield className="h-5 w-5 text-gold-400" strokeWidth={2.5} />
        <Trophy className="absolute h-2.5 w-2.5 text-white" strokeWidth={3} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-teal-700">
          Florida Rugby
        </span>
        <span className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-navy-500">
          Chamber of Commerce
        </span>
      </div>
    </div>
  );
}
