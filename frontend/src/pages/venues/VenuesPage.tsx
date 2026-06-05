import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { districtService } from '@/services/district.service';
import { VenueCard } from '@/components/venues/VenueCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Building2 } from 'lucide-react';
import type { District, Venue } from '@/types';

export function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtId, setDistrictId] = useState('');

  useEffect(() => {
    districtService.getAll().then(({ data }) => setDistricts(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    venueService
      .getAll({
        search: search || undefined,
        districtId: districtId ? Number(districtId) : undefined,
      })
      .then(({ data }) => setVenues(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [search, districtId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="To'yxonalar"
        subtitle="Tasdiqlangan eng yaxshi joylar"
      />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface-800/80 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          <option value="">Barcha rayonlar</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Spinner />
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
