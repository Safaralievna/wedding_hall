import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingService } from '@/services/booking.service';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatPrice } from '@/utils/format';
import type { Booking } from '@/types';

interface BookingsPageProps {
  admin?: boolean;
}

export function BookingsPage({ admin }: BookingsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = admin ? adminService.getBookings() : bookingService.getAll();
    fetch
      .then(({ data }) => setBookings(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [admin]);

  return (
    <div>
      <PageHeader
        title={admin ? 'Barcha bronlar' : 'Mening bronlarim'}
        subtitle="Bronlar ro'yxati"
      />
      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Bronlar yo'q" />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="glass card-hover flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{b.venue_name}</p>
                <p className="text-sm text-slate-400">
                  {formatDate(b.event_date)} · {b.district_name}
                </p>
                {!admin && b.first_name && (
                  <p className="text-xs text-slate-500">
                    {b.first_name} {b.last_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge status={b.status} />
                <span className="font-medium text-brand-400">{formatPrice(b.total_price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
