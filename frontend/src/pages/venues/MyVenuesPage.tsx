import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerService } from '@/services/owner.service';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/contexts/AuthContext';
import { VenueCard } from '@/components/venues/VenueCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Venue } from '@/types';

export function MyVenuesPage() {
  const { user, hasRole } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = hasRole('admin') ? adminService.getVenues() : ownerService.getVenues();
    api
      .then(({ data }) => setVenues(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user?.role]);

  return (
    <div>
      <PageHeader
        title={hasRole('admin') ? "Barcha to'yxonalar" : "Mening to'yxonalarim"}
        subtitle="Barcha qo'shilgan joylar"
        action={
          <Link to="/venues/new">
            <Button>
              <Plus className="h-4 w-4" />
              Yangi qo'shish
            </Button>
          </Link>
        }
      />
      {loading ? (
        <Spinner />
      ) : venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Hali to'yxona yo'q"
          description="Birinchi to'yxonangizni qo'shing"
          actionLabel="Qo'shish"
          onAction={() => window.location.assign('/venues/new')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard
              key={v.id}
              venue={v}
              showStatus
              managePath={`/venues/${v.id}/manage`}
              editPath={`/venues/${v.id}/edit`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
