import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueExtrasService } from '@/services/venueExtras.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileInput } from '@/components/ui/FileInput';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice, getImageUrl } from '@/utils/format';
import type { MenuItem } from '@/types';

interface MenuItemsManagerProps {
  venueId: number;
}

export function MenuItemsManager({ venueId }: MenuItemsManagerProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    venueExtrasService
      .listMenuItems(venueId)
      .then(({ data }) => setItems(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setImage(null);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await venueExtrasService.updateMenuItem(
          venueId,
          editId,
          { name, price: Number(price) },
          image || undefined
        );
        toast.success('Yangilandi');
      } else {
        await venueExtrasService.createMenuItem(venueId, name, Number(price), image || undefined);
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

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirasizmi?")) return;
    try {
      await venueExtrasService.deleteMenuItem(venueId, id);
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
        <h4 className="font-medium text-stone-800">{editId ? 'Tahrirlash' : 'Yangi taom paketi'}</h4>
        <Input label="Nomi" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Narxi (so'm)"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <FileInput label="Rasm (ixtiyoriy)" onChange={(files) => setImage(files[0] || null)} />
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>
            {editId ? 'Saqlash' : "Qo'shish"}
          </Button>
          {editId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Bekor
            </Button>
          )}
        </div>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl bg-cream-100 p-3">
            {getImageUrl(m.image) ? (
              <img src={getImageUrl(m.image)!} alt="" className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cream-200 text-stone-400">
                ?
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-stone-800">{m.name}</p>
              <p className="text-xs text-gold-600">{formatPrice(m.price)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditId(m.id);
                setName(m.name);
                setPrice(String(m.price));
              }}
              className="p-2 text-stone-400 hover:text-stone-800"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleDelete(m.id)} className="p-2 text-stone-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
