export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role: UserRole;
  is_verified: boolean;
}

export interface District {
  id: number;
  name: string;
}

export interface VenueImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface Venue {
  id: number;
  name: string;
  district_id: number;
  district_name: string;
  address: string;
  capacity: number;
  price: string | number;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  owner_id?: number | null;
  created_at?: string;
  images: VenueImage[];
}

export interface Singer {
  id: number;
  name: string;
  price: string | number;
  image?: string | null;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string | number;
  image?: string | null;
}

export interface KarnaySurnay {
  id: number;
  available: boolean;
  price: string | number;
}

export interface VenueDetail extends Venue {
  singers: Singer[];
  karnay_surnay: KarnaySurnay | null;
  menu_items: MenuItem[];
  bookings: Array<{
    id: number;
    event_date: string;
    guest_count: number;
    status: string;
    user_id?: number;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }>;
}

export interface Booking {
  id: number;
  event_date: string;
  guest_count: number;
  total_price: string | number;
  advance_paid: string | number;
  status: 'confirmed' | 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  venue_id: number;
  venue_name: string;
  district_id: number;
  district_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface BookingDetail extends Booking {
  user_id?: number;
  extras?: Array<{
    id: number;
    extra_type: string;
    extra_id: number;
    price: string | number;
  }>;
}

export interface AdminStats {
  venues: number;
  bookings: number;
  users: number;
  owners: number;
  revenue: string | number;
  pendingVenues: number;
  approvedVenues: number;
  upcomingBookings: number;
  cancelledBookings: number;
}

export interface OwnerStats {
  venues: number;
  bookings: number;
  upcomingBookings: number;
  approvedVenues: number;
  pendingVenues: number;
}

export interface CalendarDay {
  date: string;
  status: 'free' | 'booked' | 'past';
}

export interface Car {
  id: number;
  venue_id: number;
  brand: string;
  price: string | number;
  image?: string | null;
  created_at?: string;
}

export interface ApiError {
  message: string;
}
