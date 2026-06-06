import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { districtService } from '@/services/district.service';
import { VenueCard } from '@/components/venues/VenueCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { VenueGridSkeleton } from '@/components/ui/Skeleton';
import { Building2 } from 'lucide-react';
import type { District, Venue } from '@/types';

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    districtService.getAll().then(({ data }) => setDistricts(data)).catch(() => {});
  }, []);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      districtId: districtId ? Number(districtId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: 'price' as const,
      order: sortOrder,
    }),
    [debouncedSearch, districtId, minPrice, maxPrice, sortOrder]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    venueService
      .getAll(filters)
      .then(({ data }) => {
        if (!cancelled) setVenues(data);
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="page-container py-10">
      <PageHeader title="To'yxonalar" subtitle="Tasdiqlangan premium to'yxonalar" />

      <div className="mb-8 space-y-4">
        <div className="surface-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="To'yxona nomi bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11"
                aria-label="To'yxona qidirish"
              />
            </div>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="select-field"
              aria-label="Tuman tanlash"
            >
              <option value="">Barcha tumanlar</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="select-field"
              aria-label="Saralash"
            >
              <option value="asc">Arzondan qimmatga</option>
              <option value="desc">Qimmatdan arzonga</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <SlidersHorizontal className="h-4 w-4 text-rose-500" aria-hidden="true" />
            <input
              type="number"
              placeholder="Min narx"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="select-field w-36"
              aria-label="Minimal narx"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              placeholder="Max narx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="select-field w-36"
              aria-label="Maksimal narx"
            />
            {(search || districtId || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDistrictId('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-500"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <VenueGridSkeleton count={6} />
      ) : venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="To'yxona topilmadi"
          description="Filterlarni o'zgartirib qayta urinib ko'ring"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}
