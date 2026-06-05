import api from './api';
import type { Booking, BookingDetail } from '@/types';

export interface BookingFilters {
  venueId?: number;
  districtId?: number;
  status?: string;
}

export interface CreateBookingPayload {
  venueId: number;
  eventDate: string;
  guestCount: number;
  extras?: Array<{ type: 'singer' | 'karnay' | 'car'; id: number }>;
}

export const bookingService = {
  getAll: (params?: BookingFilters) =>
    api.get<Booking[]>('/bookings', { params }),

  getById: (id: number) => api.get<BookingDetail>(`/bookings/${id}`),

  create: (data: CreateBookingPayload) =>
    api.post<{
      booking: BookingDetail;
      payment: { totalPrice: number; advancePaid: number };
      message: string;
    }>('/bookings', data),

  cancel: (id: number) =>
    api.patch<{ booking: BookingDetail; message: string }>(`/bookings/${id}/cancel`),
};
