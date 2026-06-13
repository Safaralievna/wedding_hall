import api from './api';

export const invitationService = {
  getBySlug: (slug: string) => api.get(`/invitations/${slug}`),
};
