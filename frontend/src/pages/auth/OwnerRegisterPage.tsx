import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function OwnerRegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.createOwner(form);
      setUsername(form.username);
      if (data.devOtp) {
        toast.success(`Dev OTP: ${data.devOtp}`, { duration: 10000 });
      } else {
        toast.success('OTP emailingizga yuborildi');
      }
      setStep('otp');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.verifyOwnerOtp(username, otp);
      setSession(data.token, data.user);
      toast.success('Hisob tasdiqlandi!');
      navigate('/owner', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await authService.resendOwnerOtp(username);
      if (data.devOtp) toast.success(`Dev OTP: ${data.devOtp}`, { duration: 10000 });
      else toast.success('OTP qayta yuborildi');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    }
  };

  if (step === 'otp') {
    return (
      <div>
        <h1 className="heading-display text-2xl">OTP tasdiqlash</h1>
        <p className="mt-2 text-gray-500">
          <span className="font-semibold text-rose-600">@{username}</span> uchun 6 xonali kodni kiriting
        </p>
        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <Input
            label="OTP kod"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="123456"
            required
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Tasdiqlash
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={handleResend}>
            OTP qayta yuborish
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="heading-display text-2xl">Owner ro&apos;yxati</h1>
      <p className="mt-2 text-gray-500">To&apos;yxona egasi sifatida ro&apos;yxatdan o&apos;ting</p>
      <form onSubmit={handleRegister} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Ism"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <Input
            label="Familiya"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          label="Parol"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          hint="Kamida 8 belgi, katta/kichik harf va raqam"
          required
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Davom etish
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
          Kirish sahifasiga
        </Link>
      </p>
    </div>
  );
}
