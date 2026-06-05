import { MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Venue } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getImageUrl } from '@/utils/format';

interface VenueCardProps {
  venue: Venue;
  showStatus?: boolean;
  editPath?: string;
  managePath?: string;
}

export function VenueCard({ venue, showStatus, editPath, managePath }: VenueCardProps) {
  const primary =
    venue.images?.find((i) => i.is_primary) || venue.images?.[0];
  const imgUrl = getImageUrl(primary?.url);

  return (
    <article className="glass card-hover group overflow-hidden rounded-2xl">
      <Link to={`/venues/${venue.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-800">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-600/30 to-accent-500/20">
              <span className="text-4xl font-bold text-white/20">
                {venue.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-transparent to-transparent" />
          {showStatus && (
            <div className="absolute right-3 top-3">
              <Badge status={venue.status} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white group-hover:text-brand-300">
            {venue.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {venue.district_name}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-brand-400">
              {formatPrice(venue.price)}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <Users className="h-4 w-4" />
              {venue.capacity} kishi
            </span>
          </div>
        </div>
      </Link>
      {(editPath || managePath) && (
        <div className="flex gap-4 border-t border-white/5 px-5 py-3">
          {managePath && (
            <Link
              to={managePath}
              className="text-sm font-medium text-brand-400 hover:text-brand-300"
            >
              Boshqarish →
            </Link>
          )}
          {editPath && (
            <Link
              to={editPath}
              className="text-sm font-medium text-slate-400 hover:text-white"
            >
              Tahrirlash
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
