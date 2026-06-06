import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'rose' | 'sky' | 'emerald' | 'amber';
}

const accents = {
  rose: 'border-rose-200 bg-rose-50 text-rose-600',
  sky: 'border-sky-200 bg-sky-50 text-sky-600',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  amber: 'border-amber-200 bg-amber-50 text-amber-600',
};

export function StatCard({ label, value, icon: Icon, accent = 'rose' }: StatCardProps) {
  return (
    <div className={`surface-card card-hover p-5 ${accents[accent]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accents[accent]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
