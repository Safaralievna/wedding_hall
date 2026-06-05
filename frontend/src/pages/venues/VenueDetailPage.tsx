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

  const images = venue.images?.length
    ? venue.images
    : [];
  const primary = images.find((i) => i.is_primary) || images[0];
  const imgUrl = getImageUrl(primary?.url);
  const canManage = hasRole('owner', 'admin');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl glass">
        <div className="relative aspect-[21/9] bg-surface-800">
          {imgUrl ? (
            <img src={imgUrl} alt={venue.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-600/40 to-accent-500/20">
              <span className="text-6xl font-bold text-white/20">{venue.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge status={venue.status} />
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{venue.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4" />
              {venue.district_name} · {venue.address}
            </p>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-white/5 p-4">
            {images.map((img) => {
              const url = getImageUrl(img.url);
              return url ? (
                <img
                  key={img.id}
                  src={url}
                  alt=""
                  className={`h-16 w-24 shrink-0 rounded-lg object-cover ${img.is_primary ? 'ring-2 ring-brand-500' : ''}`}
                />
              ) : null;
            })}
          </div>
        )}

        <div className="grid gap-8 p-6 sm:grid-cols-3 sm:p-8">
          <div className="sm:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-stone-500">Stol narxi</p>
                <p className="mt-1 text-lg font-bold text-gold-600">{formatPrice(venue.price)}</p>
              </div>
              <div className="rounded-xl bg-cream-100 p-4">
                <p className="text-xs text-stone-500">Sig&apos;im (stollar)</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-bold text-stone-800">
                  <Users className="h-4 w-4 text-stone-400" />
                  {venue.capacity}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-slate-500">Telefon</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-white">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {venue.phone}
                </p>
              </div>
            </div>

            {venue.singers?.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <Music className="h-4 w-4 text-brand-400" />
                  Qo&apos;shiqchilar
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {venue.singers.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                      {getImageUrl(s.image) && (
                        <img src={getImageUrl(s.image)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-brand-400">{formatPrice(s.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {venue.menu_items?.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <UtensilsCrossed className="h-4 w-4 text-brand-400" />
                  Menyu
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {venue.menu_items.map((m) => (
                    <div key={m.id} className="rounded-xl bg-white/5 p-3 text-center">
                      {getImageUrl(m.image) ? (
                        <img src={getImageUrl(m.image)!} alt="" className="mx-auto mb-2 h-20 w-full rounded-lg object-cover" />
                      ) : null}
                      <p className="text-sm text-stone-800">{m.name}</p>
                      <p className="text-xs text-gold-600">{formatPrice(m.price)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cars.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <CarIcon className="h-4 w-4 text-brand-400" />
                  To&apos;y mashinalari
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cars.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                      {getImageUrl(c.image) && (
                        <img src={getImageUrl(c.image)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{c.brand}</p>
                        <p className="text-xs text-brand-400">{formatPrice(c.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {venue.karnay_surnay?.available && (
              <p className="text-sm text-slate-400">
                Karnay-surnay: {formatPrice(venue.karnay_surnay.price)}
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
          <h2 className="mb-4 text-lg font-semibold text-white">Bandlik kalendari</h2>
          <VenueCalendar venueId={venue.id} mode="view" />
        </div>
      )}

      {venue.bookings?.length > 0 && canManage && (
        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-white">Bronlar tarixi</h3>
          <div className="space-y-2">
            {venue.bookings.map((b) => (
              <div key={b.id} className="flex justify-between text-sm text-slate-400">
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
