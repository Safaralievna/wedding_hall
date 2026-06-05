const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  upcoming: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
};

const labels: Record<string, string> = {
  approved: 'Tasdiqlangan',
  pending: 'Kutilmoqda',
  rejected: 'Rad etilgan',
  confirmed: 'Tasdiqlangan',
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
