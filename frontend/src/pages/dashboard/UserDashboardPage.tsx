import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingService } from '@/services/booking.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPrice } from '@/utils/format';
import type { Booking } from '@/types';

export function UserDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getAll()
      .then(({ data }) => setBookings(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => b.status === 'upcoming').length;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Xush kelibsiz!" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Jami bronlar" value={bookings.length} icon={CalendarDays} />
        <StatCard label="Yaqinlashayotgan" value={upcoming} icon={CalendarDays} accent="sky" />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">So'nggi bronlar</h2>
        <Link to="/venues">
          <Button variant="secondary" size="sm">
            <Building2 className="h-4 w-4" />
            To'yxona topish
          </Button>
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <p className="text-slate-400">Hali bronlar yo'q. To'yxona tanlang va bron qiling.</p>
      ) : (
        <div className="space-y-3">
          {bookings.slice(0, 5).map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="glass card-hover flex items-center justify-between rounded-xl p-4"
            >
              <div>
                <p className="font-medium text-white">{b.venue_name}</p>
                <p className="text-sm text-slate-400">{formatDate(b.event_date)}</p>
              </div>
              <div className="text-right">
                <Badge status={b.status} />
                <p className="mt-1 text-sm text-brand-400">{formatPrice(b.total_price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
