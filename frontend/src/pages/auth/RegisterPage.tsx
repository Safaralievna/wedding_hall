import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '+998',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Parollar mos kelmaydi');
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Ro'yxatdan o'tdingiz!");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="heading-display text-2xl">Ro&apos;yxatdan o&apos;tish</h1>
      <p className="mt-2 text-gray-500">Yangi foydalanuvchi hisobi yarating</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ism"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
            autoComplete="given-name"
          />
          <Input
            label="Familiya"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
            autoComplete="family-name"
          />
        </div>
        <Input
          label="Telefon"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          hint="+998XXXXXXXXX"
          required
          autoComplete="tel"
        />
        <Input
          label="Parol"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          hint="Kamida 8 belgi, katta/kichik harf va raqam"
          required
          autoComplete="new-password"
        />
        <Input
          label="Parolni tasdiqlang"
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Yaratish
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Hisobingiz bormi?{' '}
        <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
          Kirish
        </Link>
      </p>
    </div>
  );
}
