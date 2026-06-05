import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import type { AdminStats } from '@/types';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(({ data }) => setStats(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Admin panel" subtitle="Platforma statistikasi" />
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="To'yxonalar" value={stats.venues} icon={Building2} />
            <StatCard label="Bronlar" value={stats.bookings} icon={CalendarDays} accent="sky" />
            <StatCard label="Foydalanuvchilar" value={stats.users} icon={Users} accent="emerald" />
            <StatCard label="Daromad" value={formatPrice(stats.revenue)} icon={DollarSign} accent="amber" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <p className="text-sm text-slate-400">Kutilayotgan to'yxonalar</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">{stats.pendingVenues}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-sm text-slate-400">Bekor qilingan bronlar</p>
              <p className="mt-1 text-2xl font-bold text-slate-300">{stats.cancelledBookings}</p>
            </div>
          </div>
        </>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/venues"><Button variant="secondary">To'yxonalar</Button></Link>
        <Link to="/admin/bookings"><Button variant="secondary">Bronlar</Button></Link>
        <Link to="/admin/owners"><Button variant="outline">Egalari</Button></Link>
      </div>
    </div>
  );
}
