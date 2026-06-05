import api from './api';
import type { District } from '@/types';

export const districtService = {
  getAll: () => api.get<District[]>('/districts'),
};
