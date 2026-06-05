import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'violet' | 'sky' | 'emerald' | 'amber';
}

const accents = {
  violet: 'from-brand-600/20 to-brand-500/5 text-brand-400',
  sky: 'from-sky-500/20 to-sky-500/5 text-sky-400',
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-500/5 text-amber-400',
};

export function StatCard({ label, value, icon: Icon, accent = 'violet' }: StatCardProps) {
  return (
    <div className={`glass card-hover rounded-2xl bg-gradient-to-br p-5 ${accents[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
