const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  upcoming: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const labels: Record<string, string> = {
  approved: 'Tasdiqlangan',
  pending: 'Kutilmoqda',
  rejected: 'Rad etilgan',
  upcoming: 'Yaqinlashayotgan',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status] || statusStyles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}
