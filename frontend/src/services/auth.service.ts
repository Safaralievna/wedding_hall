import api from './api';
import type { User } from '@/types';

export interface LoginPayload {
  /** Telefon, email yoki username */
  login: string;
  password: string;
}

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

export interface CreateOwnerPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<{ token: string; user: User; message: string }>('/auth/login', data),

  register: (data: RegisterUserPayload) =>
    api.post<{ token: string; user: User; message: string }>('/auth/register', data),

  createOwner: (data: CreateOwnerPayload) =>
    api.post<{ user: User; message: string; devOtp?: string }>('/auth/owners', data),

  verifyOwnerOtp: (username: string, otp: string) =>
    api.post<{ token: string; user: User; message: string }>('/auth/owners/verify-otp', {
      username,
      otp,
    }),

  resendOwnerOtp: (username: string) =>
    api.post<{ message: string; devOtp?: string }>('/auth/owners/resend-otp', { username }),

  getOwners: () => api.get<User[]>('/auth/owners'),
};
