import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService } from '@/services/booking.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate, formatPrice, fullName } from '@/utils/format';
import type { BookingDetail } from '@/types';

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    bookingService
      .getById(Number(id))
      .then(({ data }) => setBooking(data))
      .catch((e: Error) => {
        toast.error(e.message);
        navigate('/bookings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!id || !confirm('Bronni bekor qilasizmi?')) return;
    setCancelling(true);
    try {
      await bookingService.cancel(Number(id));
      toast.success('Bron bekor qilindi');
      const { data } = await bookingService.getById(Number(id));
      setBooking(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!booking) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Bron tafsilotlari" />
      <div className="surface-card space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900">{booking.venue_name}</h2>
            <p className="text-gray-500">{booking.district_name}</p>
          </div>
          <Badge status={booking.status} />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Sana</dt>
            <dd className="font-semibold text-gray-900">{formatDate(booking.event_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Stollar soni</dt>
            <dd className="font-semibold text-gray-900">{booking.guest_count}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Jami summa</dt>
            <dd className="font-semibold text-rose-600">{formatPrice(booking.total_price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Oldindan to&apos;lov (20%)</dt>
            <dd className="font-semibold text-gray-900">{formatPrice(booking.advance_paid)}</dd>
          </div>
          {booking.first_name && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500">Mijoz</dt>
              <dd className="font-semibold text-gray-900">
                {fullName(booking.first_name, booking.last_name)} · {booking.phone}
              </dd>
            </div>
          )}
        </dl>
        {booking.extras && booking.extras.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Qo&apos;shimcha xizmatlar</h3>
            <ul className="space-y-1 text-sm">
              {booking.extras.map((e) => (
                <li key={e.id} className="flex justify-between text-gray-700">
                  <span className="capitalize">{e.extra_type}</span>
                  <span className="font-medium">{formatPrice(e.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {['confirmed', 'upcoming'].includes(booking.status) && (
          <Button variant="danger" onClick={handleCancel} loading={cancelling}>
            Bekor qilish
          </Button>
        )}
      </div>
    </div>
  );
}
