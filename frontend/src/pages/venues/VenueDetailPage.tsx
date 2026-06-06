import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Users, Phone, Calendar, Music, UtensilsCrossed, Car as CarIcon, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { venueExtrasService } from '@/services/venueExtras.service';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { VenueCalendar } from '@/components/venues/VenueCalendar';
import { formatPrice, formatDate, getImageUrl } from '@/utils/format';
import type { Car, VenueDetail } from '@/types';

export function VenueDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, hasRole } = useAuth();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const vid = Number(id);
    Promise.all([
      venueService.getById(vid),
      venueExtrasService.listCars(vid).catch(() => ({ data: [] as Car[] })),
    ])
      .then(([venueRes, carsRes]) => {
        setVenue(venueRes.data);
        setCars(carsRes.data);
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="min-h-[60vh]" />;
  if (!venue) return null;

  const images = venue.images?.length ? venue.images : [];
  const primary = images.find((i) => i.is_primary) || images[0];
  const imgUrl = getImageUrl(primary?.url);
  const canManage = hasRole('owner', 'admin');

  return (
    <div className="page-container py-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-gray-900/5">
        <div className="relative aspect-[21/9] bg-cream-200">
          {imgUrl ? (
            <img src={imgUrl} alt={venue.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-400/10 to-gold-400/10">
              <span className="font-display text-6xl font-semibold text-gray-300">{venue.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge status={venue.status} />
            <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{venue.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-gray-200">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {venue.district_name} · {venue.address}
            </p>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-border p-4">
            {images.map((img) => {
              const url = getImageUrl(img.url);
              return url ? (
                <img
                  key={img.id}
                  src={url}
                  alt=""
                  className={`h-16 w-24 shrink-0 rounded-lg border border-border object-cover ${img.is_primary ? 'ring-2 ring-rose-400' : ''}`}
                />
              ) : null;
            })}
          </div>
        )}

        <div className="grid gap-8 p-6 sm:grid-cols-3 sm:p-8">
          <div className="space-y-6 sm:col-span-2">
            {venue.description && (
              <p className="leading-relaxed text-gray-600">{venue.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-cream-100 p-4">
                <p className="text-xs font-medium text-gray-500">Stol narxi</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{formatPrice(venue.price)}</p>
              </div>
              <div className="rounded-xl border border-border bg-cream-100 p-4">
                <p className="text-xs font-medium text-gray-500">Sig&apos;im (stollar)</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-bold text-gray-900">
                  <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  {venue.capacity}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-cream-100 p-4">
                <p className="text-xs font-medium text-gray-500">Telefon</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-800">
                  <Phone className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  {venue.phone}
                </p>
              </div>
            </div>

            {venue.singers?.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <Music className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  Qo&apos;shiqchilar
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {venue.singers.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                      {getImageUrl(s.image) && (
                        <img src={getImageUrl(s.image)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs font-semibold text-rose-600">{formatPrice(s.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {venue.menu_items?.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <UtensilsCrossed className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  Menyu
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {venue.menu_items.map((m) => (
                    <div key={m.id} className="rounded-xl border border-border bg-surface p-3 text-center">
                      {getImageUrl(m.image) ? (
                        <img src={getImageUrl(m.image)!} alt="" className="mx-auto mb-2 h-20 w-full rounded-lg object-cover" />
                      ) : null}
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs font-semibold text-rose-600">{formatPrice(m.price)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cars.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <CarIcon className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  To&apos;y mashinalari
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cars.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                      {getImageUrl(c.image) && (
                        <img src={getImageUrl(c.image)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.brand}</p>
                        <p className="text-xs font-semibold text-rose-600">{formatPrice(c.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {venue.karnay_surnay?.available && (
              <p className="text-sm text-gray-600">
                Karnay-surnay: <span className="font-semibold text-gray-900">{formatPrice(venue.karnay_surnay.price)}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            {hasRole('user') && venue.status === 'approved' && (
              <Link to={`/bookings/new/${venue.id}`}>
                <Button className="w-full" size="lg">
                  <Calendar className="h-5 w-5" />
                  Bron qilish
                </Button>
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login">
                <Button className="w-full" size="lg">
                  Bron uchun kiring
                </Button>
              </Link>
            )}
            {canManage && (
              <>
                <Link to={`/venues/${venue.id}/manage`}>
                  <Button className="w-full" variant="secondary">
                    <Settings className="h-4 w-4" />
                    To&apos;liq boshqarish
                  </Button>
                </Link>
                <Link to={`/venues/${venue.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Tahrirlash
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {venue.status === 'approved' && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Bandlik kalendari</h2>
          <VenueCalendar venueId={venue.id} mode="view" />
        </div>
      )}

      {venue.bookings?.length > 0 && canManage && (
        <div className="mt-8 surface-card p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Bronlar tarixi</h3>
          <div className="space-y-2">
            {venue.bookings.map((b) => (
              <div key={b.id} className="flex justify-between text-sm text-gray-600">
                <span>{formatDate(b.event_date)}</span>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
