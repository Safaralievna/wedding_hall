import api from './api';
import type { AdminStats, Booking, Venue } from '@/types';
import type { VenueFilters } from './venue.service';

export const adminService = {
  getStats: () => api.get<AdminStats>('/admin/stats'),

  getVenues: (params?: VenueFilters) =>
    api.get<Venue[]>('/admin/venues', { params }),

  getBookings: (params?: { venueId?: number; districtId?: number; status?: string }) =>
    api.get<Booking[]>('/admin/bookings', { params }),
};
