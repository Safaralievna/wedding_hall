import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueExtrasService } from '@/services/venueExtras.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileInput } from '@/components/ui/FileInput';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice, getImageUrl } from '@/utils/format';
import type { Car } from '@/types';

interface CarsManagerProps {
  venueId: number;
}

export function CarsManager({ venueId }: CarsManagerProps) {
  const [items, setItems] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    venueExtrasService
      .listCars(venueId)
      .then(({ data }) => setItems(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setBrand('');
    setPrice('');
    setImage(null);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await venueExtrasService.updateCar(
          venueId,
          editId,
          { brand, price: Number(price) },
          image || undefined
        );
        toast.success('Yangilandi');
      } else {
        await venueExtrasService.createCar(
          venueId,
          { brand, price: Number(price) },
          image || undefined
        );
        toast.success("Qo'shildi");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Car) => {
    setEditId(c.id);
    setBrand(c.brand);
    setPrice(String(c.price));
    setImage(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirasizmi?")) return;
    try {
      await venueExtrasService.deleteCar(venueId, id);
      toast.success("O'chirildi");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-xl p-4">
        <h4 className="font-medium text-white">{editId ? 'Tahrirlash' : 'Yangi mashina'}</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Brend / model" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          <Input label="Narx" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <FileInput label="Rasm (ixtiyoriy)" onChange={(files) => setImage(files[0] || null)} />
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>{editId ? 'Saqlash' : "Qo'shish"}</Button>
          {editId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Bekor
            </Button>
          )}
        </div>
      </form>
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-4 rounded-xl bg-white/5 p-3">
            {getImageUrl(c.image) ? (
              <img src={getImageUrl(c.image)!} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
                🚗
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-white">{c.brand}</p>
              <p className="text-sm text-brand-400">{formatPrice(c.price)}</p>
            </div>
            <button type="button" onClick={() => startEdit(c)} className="p-2 text-slate-400 hover:text-white">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
