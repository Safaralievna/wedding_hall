import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerService } from '@/services/owner.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { OwnerStats } from '@/types';

export function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerService
      .getStats()
      .then(({ data }) => setStats(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Owner panel"
        subtitle="To'yxonalaringiz statistikasi"
        action={
          <Link to="/venues/new">
            <Button>Yangi to'yxona</Button>
          </Link>
        }
      />
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="To'yxonalar" value={stats.venues} icon={Building2} />
          <StatCard label="Bronlar" value={stats.bookings} icon={CalendarDays} accent="sky" />
          <StatCard label="Yaqinlashayotgan" value={stats.upcomingBookings} icon={Clock} accent="amber" />
          <StatCard label="Tasdiqlangan" value={stats.approvedVenues} icon={Building2} accent="emerald" />
        </div>
      )}
      <div className="mt-8 flex gap-4">
        <Link to="/my-venues">
          <Button variant="secondary">Mening to'yxonalarim</Button>
        </Link>
        <Link to="/bookings">
          <Button variant="outline">Bronlar</Button>
        </Link>
      </div>
    </div>
  );
}
