import { useCallback, useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueExtrasService } from '@/services/venueExtras.service';
import { FileInput } from '@/components/ui/FileInput';
import { Spinner } from '@/components/ui/Spinner';
import { getImageUrl } from '@/utils/format';
import type { VenueImage } from '@/types';

interface VenueImageManagerProps {
  venueId: number;
}

export function VenueImageManager({ venueId }: VenueImageManagerProps) {
  const [images, setImages] = useState<VenueImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    venueExtrasService
      .listImages(venueId)
      .then(({ data }) => setImages(data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      await venueExtrasService.uploadImages(venueId, files, 0);
      toast.success('Rasmlar yuklandi');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Rasmni o'chirasizmi?")) return;
    try {
      await venueExtrasService.deleteImage(imageId);
      toast.success("Rasm o'chirildi");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await venueExtrasService.setPrimaryImage(venueId, imageId);
      toast.success('Asosiy rasm belgilandi');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <FileInput
        label="Yangi rasmlar"
        multiple
        hint="JPEG, PNG, WebP — maks. 5MB"
        onChange={handleUpload}
      />
      {uploading && <p className="text-sm text-brand-400">Yuklanmoqda...</p>}
      {images.length === 0 ? (
        <p className="text-center text-sm text-slate-500">Hali rasmlar yo&apos;q</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => {
            const url = getImageUrl(img.url);
            return (
              <div key={img.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                {url ? (
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square bg-surface-800" />
                )}
                {img.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                    Asosiy
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="rounded-lg bg-white/10 p-2 text-amber-300 hover:bg-white/20"
                      title="Asosiy qilish"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="rounded-lg bg-white/10 p-2 text-red-300 hover:bg-white/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
