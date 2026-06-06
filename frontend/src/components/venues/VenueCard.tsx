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
    <article className="surface-card card-hover group overflow-hidden">
      <Link to={`/venues/${venue.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-400/10 to-gold-400/10">
              <span className="font-display text-4xl font-semibold text-gray-300">
                {venue.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
          {showStatus && (
            <div className="absolute right-3 top-3">
              <Badge status={venue.status} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold text-gray-900 transition-colors group-hover:text-rose-600">
            {venue.name}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {venue.district_name}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div>
              <span className="text-lg font-bold text-gray-900">{formatPrice(venue.price)}</span>
              <span className="ml-1 text-xs text-gray-400">/ stol</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-4 w-4" aria-hidden="true" />
              {venue.capacity} stol
            </span>
          </div>
        </div>
      </Link>
      {(editPath || managePath) && (
        <div className="flex gap-4 border-t border-border px-5 py-3">
          {managePath && (
            <Link to={managePath} className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors">
              Boshqarish →
            </Link>
          )}
          {editPath && (
            <Link to={editPath} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              Tahrirlash
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
