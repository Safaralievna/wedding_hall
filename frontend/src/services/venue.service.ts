import api from './api';
import type { CalendarDay, Venue, VenueDetail } from '@/types';

export interface VenueFilters {
  search?: string;
  districtId?: number;
  status?: string;
  sortBy?: 'capacity' | 'price';
  order?: 'asc' | 'desc';
}

export interface CreateVenuePayload {
  name: string;
  districtId: number;
  address: string;
  capacity: number;
  price: number;
  phone: string;
  ownerId?: number;
}

export const venueService = {
  getAll: (params?: VenueFilters) =>
    api.get<Venue[]>('/venues', { params }),

  getById: (id: number) => api.get<VenueDetail>(`/venues/${id}`),

  getCalendar: (id: number, startDate: string, endDate: string) =>
    api.get<{ venueId: number; days: CalendarDay[] }>(`/venues/${id}/calendar`, {
      params: { startDate, endDate },
    }),

  create: (data: CreateVenuePayload) =>
    api.post<{ venue: Venue; message: string }>('/venues', data),

  update: (id: number, data: Partial<CreateVenuePayload & { status?: string }>) =>
    api.patch<{ venue: Venue; message: string }>(`/venues/${id}`, data),

  delete: (id: number) => api.delete<{ message: string }>(`/venues/${id}`),

  approve: (id: number) =>
    api.patch<{ venue: Venue; message: string }>(`/venues/${id}/approve`),
};
