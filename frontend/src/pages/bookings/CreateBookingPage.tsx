import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { venueExtrasService } from '@/services/venueExtras.service';
import { bookingService } from '@/services/booking.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { VenueCalendar } from '@/components/venues/VenueCalendar';
import { formatPrice } from '@/utils/format';
import type { Car, VenueDetail } from '@/types';

export function CreateBookingPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [selectedSinger, setSelectedSinger] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [includeKarnay, setIncludeKarnay] = useState(false);

  useEffect(() => {
    if (!venueId) return;
    const vid = Number(venueId);
    Promise.all([
      venueService.getById(vid),
      venueExtrasService.listCars(vid).catch(() => ({ data: [] as Car[] })),
    ])
      .then(([venueRes, carsRes]) => {
        setVenue(venueRes.data);
        setCars(carsRes.data);
      })
      .catch((e: Error) => {
        toast.error(e.message);
        navigate('/venues');
      })
      .finally(() => setLoading(false));
  }, [venueId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId || !eventDate) {
      toast.error('Sanani tanlang');
      return;
    }
    const extras: Array<{ type: 'singer' | 'karnay' | 'car'; id: number }> = [];
    if (selectedSinger) extras.push({ type: 'singer', id: Number(selectedSinger) });
    if (includeKarnay && venue?.karnay_surnay) {
      extras.push({ type: 'karnay', id: venue.karnay_surnay.id });
    }
    if (selectedCar) extras.push({ type: 'car', id: Number(selectedCar) });

    setSaving(true);
    try {
      const { data } = await bookingService.create({
        venueId: Number(venueId),
        eventDate,
        guestCount: Number(guestCount),
        extras,
      });
      toast.success(data.message);
      navigate(`/bookings/${data.booking.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!venue) return null;

  const estimatedBase = guestCount
    ? Number(venue.price) * Number(guestCount)
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Bron qilish" subtitle={venue.name} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Bo&apos;sh kunni tanlang</p>
          <VenueCalendar
            venueId={venue.id}
            mode="select"
            selectedDate={eventDate}
            onSelectDate={setEventDate}
          />
          {eventDate && (
            <p className="mt-2 text-sm text-brand-400">
              Tanlangan: {new Date(eventDate).toLocaleDateString('uz-UZ')}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
          <Input
            label="Tadbir sanasi"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <Input
            label="Mehmonlar soni"
            type="number"
            min={1}
            max={venue.capacity}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            hint={`Maksimum: ${venue.capacity}`}
            required
          />
          {venue.singers?.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Qo&apos;shiqchi (ixtiyoriy)
              </label>
              <select
                value={selectedSinger}
                onChange={(e) => setSelectedSinger(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white"
              >
                <option value="">Tanlanmagan</option>
                {venue.singers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(s.price)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {cars.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Mashina (ixtiyoriy)
              </label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white"
              >
                <option value="">Tanlanmagan</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} — {formatPrice(c.price)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {venue.karnay_surnay?.available && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={includeKarnay}
                onChange={(e) => setIncludeKarnay(e.target.checked)}
                className="rounded border-white/20"
              />
              Karnay-surnay ({formatPrice(venue.karnay_surnay.price)})
            </label>
          )}
          <div className="rounded-xl bg-brand-500/10 p-4 text-sm">
            <p className="text-slate-400">Taxminiy asosiy summa</p>
            <p className="text-lg font-bold text-brand-400">
              {estimatedBase > 0 ? formatPrice(estimatedBase) : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              + qo&apos;shimcha xizmatlar. Oldindan to&apos;lov 20%.
            </p>
          </div>
          <Button type="submit" className="w-full" loading={saving} disabled={!eventDate}>
            Bronni tasdiqlash
          </Button>
        </form>
      </div>
    </div>
  );
}
