import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { venueExtrasService } from '@/services/venueExtras.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
interface KarnaySurnayManagerProps {
  venueId: number;
}

export function KarnaySurnayManager({ venueId }: KarnaySurnayManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(false);
  const [price, setPrice] = useState('');

  useEffect(() => {
    venueExtrasService
      .getKarnaySurnay(venueId)
      .then(({ data }) => {
        if (data) {
          setAvailable(data.available);
          setPrice(data.price ? String(data.price) : '');
        }
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await venueExtrasService.saveKarnaySurnay(venueId, {
        available,
        price: available ? Number(price) : undefined,
      });
      toast.success('Saqlandi');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={handleSubmit} className="glass max-w-md space-y-4 rounded-xl p-6">
      <h4 className="font-medium text-white">Karnay-surnay xizmati</h4>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-white/20"
        />
        Xizmat mavjud
      </label>
      {available && (
        <Input
          label="Narx"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      )}
      <Button type="submit" loading={saving}>
        Saqlash
      </Button>
    </form>
  );
}
