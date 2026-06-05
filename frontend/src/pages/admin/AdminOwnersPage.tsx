import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { fullName } from '@/utils/format';
import type { User } from '@/types';

export function AdminOwnersPage() {
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getOwners()
      .then(({ data }) => setOwners(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="To'yxona egalari" subtitle="Barcha ownerlar ro'yxati" />
      {loading ? (
        <Spinner />
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Ism</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{fullName(o.first_name, o.last_name)}</td>
                  <td className="px-4 py-3 text-slate-400">{o.email}</td>
                  <td className="px-4 py-3 text-slate-400">@{o.username}</td>
                  <td className="px-4 py-3">
                    <Badge status={o.is_verified ? 'approved' : 'pending'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
