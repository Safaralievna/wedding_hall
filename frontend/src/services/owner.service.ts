import api from './api';
import type { OwnerStats, Venue } from '@/types';
import type { VenueFilters } from './venue.service';

export const ownerService = {
  getStats: () => api.get<OwnerStats>('/owner/stats'),

  getVenues: (params?: VenueFilters) =>
    api.get<Venue[]>('/owner/venues', { params }),
};
