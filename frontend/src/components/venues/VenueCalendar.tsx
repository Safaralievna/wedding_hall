import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { venueService } from '@/services/venue.service';
import type { CalendarDay } from '@/types';

interface VenueCalendarProps {
  venueId: number;
  mode?: 'view' | 'select';
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

export function VenueCalendar({
  venueId,
  mode = 'view',
  selectedDate,
  onSelectDate,
}: VenueCalendarProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  useEffect(() => {
    const { startDate, endDate } = getMonthRange(year, month);
    setLoading(true);
    venueService
      .getCalendar(venueId, startDate, endDate)
      .then(({ data }) => setDays(data.days))
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [venueId, year, month]);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d.status])), [days]);

  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    let startPad = first.getDay() - 1;
    if (startPad < 0) startPad = 6;

    const cells: Array<{ date: string | null; status?: CalendarDay['status'] }> = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null });
    for (let d = 1; d <= last.getDate(); d++) {
      const date = toYmd(new Date(year, month, d));
      cells.push({ date, status: dayMap.get(date) });
    }
    return cells;
  }, [year, month, dayMap]);

  const statusStyles: Record<string, string> = {
    free: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    booked: 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed',
    past: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  };

  const legend = (
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" /> Bo&apos;sh
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-red-200 bg-red-50" /> Band
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-gray-200 bg-gray-100" /> O&apos;tgan
      </span>
    </div>
  );

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {MONTHS_UZ[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-cream-200 hover:text-gray-900"
            aria-label="Oldingi oy"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-cream-200 hover:text-gray-900"
            aria-label="Keyingi oy"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-7 gap-1 ${loading ? 'opacity-50' : ''}`}>
        {grid.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const status = cell.status || 'free';
          const isSelected = selectedDate === cell.date;
          const canSelect = mode === 'select' && status === 'free';

          return (
            <button
              key={cell.date}
              type="button"
              disabled={!canSelect && mode === 'select'}
              onClick={() => canSelect && cell.date && onSelectDate?.(cell.date)}
              className={`aspect-square rounded-lg border text-sm font-medium transition-all ${statusStyles[status]} ${
                isSelected ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-cream-50' : ''
              } ${canSelect ? 'cursor-pointer' : ''}`}
            >
              {new Date(cell.date).getDate()}
            </button>
          );
        })}
      </div>
      {legend}
    </div>
  );
}
