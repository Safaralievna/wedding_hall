import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { districtService } from '@/services/district.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { District } from '@/types';

export function VenueFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    districtId: '',
    address: '',
    capacity: '',
    price: '',
    phone: '+998',
  });

  useEffect(() => {
    districtService.getAll().then(({ data }) => setDistricts(data));
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    venueService
      .getById(Number(id))
      .then(({ data }) => {
        setForm({
          name: data.name,
          districtId: String(data.district_id),
          address: data.address,
          capacity: String(data.capacity),
          price: String(data.price),
          phone: data.phone,
        });
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      districtId: Number(form.districtId),
      address: form.address,
      capacity: Number(form.capacity),
      price: Number(form.price),
      phone: form.phone,
    };
    try {
      if (isEdit && id) {
        await venueService.update(Number(id), payload);
        toast.success("To'yxona yangilandi");
        navigate(`/venues/${id}/manage`);
      } else {
        const { data } = await venueService.create(payload);
        toast.success("To'yxona yaratildi. Endi rasmlar va xizmatlarni qo'shing");
        navigate(`/venues/${data.venue.id}/manage`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={isEdit ? "To'yxonani tahrirlash" : "Yangi to'yxona"}
        subtitle={isEdit ? undefined : "Ma'lumotlarni to'ldiring"}
      />
      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
        <Input label="Nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Rayon</label>
          <select
            value={form.districtId}
            onChange={(e) => setForm({ ...form, districtId: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2.5 text-sm text-white"
            required
          >
            <option value="">Tanlang</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <Input label="Manzil" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Sig'im" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
          <Input label="Narx (kishi)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
        <Input label="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Button type="submit" loading={saving}>{isEdit ? 'Saqlash' : 'Yaratish'}</Button>
      </form>
    </div>
  );
}
