import api from './api';
import type { Car, KarnaySurnay, MenuItem, Singer, VenueImage } from '@/types';

export const venueExtrasService = {
  // Images
  listImages: (venueId: number) => api.get<VenueImage[]>(`/venues/${venueId}/images`),

  uploadImages: (venueId: number, files: File[], primaryIndex = 0) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    form.append('primaryIndex', String(primaryIndex));
    return api.post<{ message: string; images: VenueImage[] }>(
      `/venues/${venueId}/images`,
      form
    );
  },

  deleteImage: (imageId: number) =>
    api.delete<{ message: string }>(`/venues/images/${imageId}`),

  setPrimaryImage: (venueId: number, imageId: number) =>
    api.patch<{ message: string; image: VenueImage }>(
      `/venues/${venueId}/images/${imageId}/primary`
    ),

  // Singers
  listSingers: (venueId: number) => api.get<Singer[]>(`/venues/${venueId}/singers`),

  createSinger: (venueId: number, data: { name: string; price: number }, image?: File) => {
    const form = new FormData();
    form.append('name', data.name);
    form.append('price', String(data.price));
    if (image) form.append('image', image);
    return api.post<{ message: string; singer: Singer }>(`/venues/${venueId}/singers`, form);
  },

  updateSinger: (
    venueId: number,
    singerId: number,
    data: { name?: string; price?: number },
    image?: File
  ) => {
    const form = new FormData();
    if (data.name !== undefined) form.append('name', data.name);
    if (data.price !== undefined) form.append('price', String(data.price));
    if (image) form.append('image', image);
    return api.patch<{ message: string; singer: Singer }>(
      `/venues/${venueId}/singers/${singerId}`,
      form
    );
  },

  deleteSinger: (venueId: number, singerId: number) =>
    api.delete<{ message: string }>(`/venues/${venueId}/singers/${singerId}`),

  // Karnay-surnay
  getKarnaySurnay: (venueId: number) =>
    api.get<KarnaySurnay | null>(`/venues/${venueId}/karnay-surnay`),

  saveKarnaySurnay: (venueId: number, data: { available: boolean; price?: number }) =>
    api.put<{ message: string; item: KarnaySurnay }>(`/venues/${venueId}/karnay-surnay`, data),

  // Menu
  listMenuItems: (venueId: number) => api.get<MenuItem[]>(`/venues/${venueId}/menu-items`),

  createMenuItem: (venueId: number, name: string, image?: File) => {
    const form = new FormData();
    form.append('name', name);
    if (image) form.append('image', image);
    return api.post<{ message: string; menuItem: MenuItem }>(
      `/venues/${venueId}/menu-items`,
      form
    );
  },

  updateMenuItem: (venueId: number, menuItemId: number, name?: string, image?: File) => {
    const form = new FormData();
    if (name !== undefined) form.append('name', name);
    if (image) form.append('image', image);
    return api.patch<{ message: string; menuItem: MenuItem }>(
      `/venues/${venueId}/menu-items/${menuItemId}`,
      form
    );
  },

  deleteMenuItem: (venueId: number, menuItemId: number) =>
    api.delete<{ message: string }>(`/venues/${venueId}/menu-items/${menuItemId}`),

  // Cars
  listCars: (venueId: number) => api.get<Car[]>(`/venues/${venueId}/cars`),

  createCar: (venueId: number, data: { brand: string; price: number }, image?: File) => {
    const form = new FormData();
    form.append('brand', data.brand);
    form.append('price', String(data.price));
    if (image) form.append('image', image);
    return api.post<{ message: string; car: Car }>(`/venues/${venueId}/cars`, form);
  },

  updateCar: (
    venueId: number,
    carId: number,
    data: { brand?: string; price?: number },
    image?: File
  ) => {
    const form = new FormData();
    if (data.brand !== undefined) form.append('brand', data.brand);
    if (data.price !== undefined) form.append('price', String(data.price));
    if (image) form.append('image', image);
    return api.patch<{ message: string; car: Car }>(
      `/venues/${venueId}/cars/${carId}`,
      form
    );
  },

  deleteCar: (venueId: number, carId: number) =>
    api.delete<{ message: string }>(`/venues/${venueId}/cars/${carId}`),
};
