export const formatPrice = (value: string | number) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm";
};

export const formatDate = (value: string) => {
  const d = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  return d.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_UPLOADS_URL || '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const fullName = (first?: string, last?: string) =>
  [first, last].filter(Boolean).join(' ') || '—';
