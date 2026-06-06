import { useEffect, useMemo, useState } from 'react';
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
import { PaymentModal } from '@/components/bookings/PaymentModal';
import { formatPrice } from '@/utils/format';
import { calculateBookingPrice } from '@/utils/bookingPrice';
import type { Car, VenueDetail } from '@/types';

export function CreateBookingPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDate, setEventDate] = useState('');
  const [tableCount, setTableCount] = useState('');
  const [selectedSinger, setSelectedSinger] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('');
  const [includeKarnay, setIncludeKarnay] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

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

  const priceBreakdown = useMemo(() => {
    if (!venue || !tableCount) {
      return { baseTotal: 0, extrasTotal: 0, totalPrice: 0, advancePaid: 0, extras: [] as Array<{ label: string; price: number }> };
    }

    const extras: Array<{ label: string; price: number }> = [];
    const singer = venue.singers?.find((s) => String(s.id) === selectedSinger);
    if (singer) extras.push({ label: singer.name, price: Number(singer.price) });

    const car = cars.find((c) => String(c.id) === selectedCar);
    if (car) extras.push({ label: car.brand, price: Number(car.price) });

    const menu = venue.menu_items?.find((m) => String(m.id) === selectedMenu);
    if (menu) extras.push({ label: menu.name, price: Number(menu.price) });

    if (includeKarnay && venue.karnay_surnay?.available) {
      extras.push({ label: 'Karnay-surnay', price: Number(venue.karnay_surnay.price) });
    }

    const calc = calculateBookingPrice(
      venue.price,
      Number(tableCount),
      extras.map((e) => ({ type: 'singer', price: e.price }))
    );

    return { ...calc, extras };
  }, [venue, tableCount, selectedSinger, selectedCar, selectedMenu, includeKarnay, cars]);

  const buildExtrasPayload = () => {
    const extras: Array<{ type: 'singer' | 'karnay' | 'car' | 'menu'; id: number }> = [];
    if (selectedSinger) extras.push({ type: 'singer', id: Number(selectedSinger) });
    if (includeKarnay && venue?.karnay_surnay) {
      extras.push({ type: 'karnay', id: venue.karnay_surnay.id });
    }
    if (selectedCar) extras.push({ type: 'car', id: Number(selectedCar) });
    if (selectedMenu) extras.push({ type: 'menu', id: Number(selectedMenu) });
    return extras;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId || !eventDate || !tableCount) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!venueId || !eventDate) return;

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const { data } = await bookingService.create({
      venueId: Number(venueId),
      eventDate,
      guestCount: Number(tableCount),
      extras: buildExtrasPayload(),
    });

    setShowPayment(false);
    toast.success(data.message || 'Booking completed successfully');
    navigate(`/bookings/${data.booking.id}`);
  };

  if (loading) return <Spinner />;
  if (!venue) return null;

  const selectClass = 'select-field w-full';

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Bron qilish" subtitle={venue.name} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-600">Bo&apos;sh kunni tanlang</p>
          <VenueCalendar
            venueId={venue.id}
            mode="select"
            selectedDate={eventDate}
            onSelectDate={setEventDate}
          />
          {eventDate && (
            <p className="mt-2 text-sm font-medium text-rose-600">
              Tanlangan: {new Date(`${eventDate}T00:00:00`).toLocaleDateString('uz-UZ')}
            </p>
          )}
        </div>
        <form onSubmit={handleContinue} className="glass space-y-4 rounded-2xl p-6">
          <Input
            label="Tadbir sanasi"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <Input
            label="Stollar soni"
            type="number"
            min={1}
            max={venue.capacity}
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            hint={`Maksimum: ${venue.capacity} stol`}
            required
          />
          {venue.singers?.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Artist (ixtiyoriy)
              </label>
              <select
                value={selectedSinger}
                onChange={(e) => setSelectedSinger(e.target.value)}
                className={selectClass}
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mashina (ixtiyoriy)
              </label>
              <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} className={selectClass}>
                <option value="">Tanlanmagan</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} — {formatPrice(c.price)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {venue.menu_items?.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Taom paketi (ixtiyoriy)
              </label>
              <select value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)} className={selectClass}>
                <option value="">Tanlanmagan</option>
                {venue.menu_items.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {formatPrice(m.price)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {venue.karnay_surnay?.available && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeKarnay}
                onChange={(e) => setIncludeKarnay(e.target.checked)}
                className="rounded border-border text-rose-500 focus:ring-rose-400"
              />
              Karnay-surnay ({formatPrice(venue.karnay_surnay.price)})
            </label>
          )}
          <div className="rounded-xl bg-cream-100 p-4 text-sm">
            <p className="font-medium text-gray-700">Narx hisob-kitobi</p>
            {tableCount ? (
              <div className="mt-2 space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>
                    Stollar ({tableCount} × {formatPrice(venue.price)})
                  </span>
                  <span>{formatPrice(priceBreakdown.baseTotal)}</span>
                </div>
                {priceBreakdown.extras.map((extra) => (
                  <div key={extra.label} className="flex justify-between">
                    <span>{extra.label}</span>
                    <span>{formatPrice(extra.price)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-gray-900">
                  <span>Jami</span>
                  <span>{formatPrice(priceBreakdown.totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Oldindan to&apos;lov: {formatPrice(priceBreakdown.advancePaid)} (20%)
                </p>
              </div>
            ) : (
              <p className="mt-2 text-gray-400">Stollar sonini kiriting</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!eventDate || !tableCount}>
            Continue
          </Button>
        </form>
      </div>

      <PaymentModal
        open={showPayment}
        totalPrice={priceBreakdown.totalPrice}
        advancePaid={priceBreakdown.advancePaid}
        onClose={() => setShowPayment(false)}
        onPay={handlePayment}
      />
    </div>
  );
}
