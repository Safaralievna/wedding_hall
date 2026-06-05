import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin.service';
import { venueService } from '@/services/venue.service';
import { VenueCard } from '@/components/venues/VenueCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Venue } from '@/types';

export function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    adminService
      .getVenues({ status: statusFilter || undefined })
      .then(({ data }) => setVenues(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      await venueService.approve(id);
      toast.success('Tasdiqlandi');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    }
  };

  return (
    <div>
      <PageHeader title="Barcha to'yxonalar" subtitle="Admin boshqaruvi" />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-6 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-sm text-white"
      >
        <option value="">Barcha statuslar</option>
        <option value="pending">Kutilmoqda</option>
        <option value="approved">Tasdiqlangan</option>
      </select>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <div key={v.id} className="relative">
              <VenueCard
                venue={v}
                showStatus
                managePath={`/venues/${v.id}/manage`}
                editPath={`/venues/${v.id}/edit`}
              />
              {v.status === 'pending' && (
                <div className="mt-2 px-1">
                  <Button size="sm" className="w-full" onClick={() => handleApprove(v.id)}>
                    Tasdiqlash
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
