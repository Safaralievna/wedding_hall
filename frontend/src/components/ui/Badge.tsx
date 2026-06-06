const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  upcoming: 'bg-sky-50 text-sky-800 border-sky-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status] || statusStyles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}
