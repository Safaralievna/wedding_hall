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
  const primary = venue.images?.find((i) => i.is_primary) || venue.images?.[0];
  const imgUrl = getImageUrl(primary?.url);

  return (
    <article className="glass card-hover group overflow-hidden rounded-2xl">
      <Link to={`/venues/${venue.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gold-400/20 to-blush-400/20">
              <span className="font-display text-4xl font-bold text-gold-400/40">
                {venue.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
          {showStatus && (
            <div className="absolute right-3 top-3">
              <Badge status={venue.status} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-stone-800 group-hover:text-gold-600">
            {venue.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {venue.district_name}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gold-600">{formatPrice(venue.price)}</span>
              <span className="ml-1 text-xs text-stone-400">/ stol</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-stone-500">
              <Users className="h-4 w-4" />
              {venue.capacity} stol
            </span>
          </div>
        </div>
      </Link>
      {(editPath || managePath) && (
        <div className="flex gap-4 border-t border-gold-400/10 px-5 py-3">
          {managePath && (
            <Link to={managePath} className="text-sm font-medium text-gold-600 hover:text-gold-500">
              Boshqarish →
            </Link>
          )}
          {editPath && (
            <Link to={editPath} className="text-sm font-medium text-stone-500 hover:text-stone-800">
              Tahrirlash
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
