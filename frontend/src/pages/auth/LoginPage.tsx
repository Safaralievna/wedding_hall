import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(loginId.trim(), password);
      toast.success('Xush kelibsiz!');
      const dest =
        from ||
        (user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="heading-display text-2xl">Hisobingizga kiring</h1>
      <p className="mt-2 text-gray-500">
        Telefon, email yoki username va parol bilan kirish
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input
          label="Login"
          name="login"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="admin@wedding.uz yoki jasur01 yoki +998..."
          hint="User: telefon · Admin: email · Owner: username"
          required
          autoComplete="username"
        />
        <Input
          label="Parol"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Kirish
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-border bg-cream-100 p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700">Test hisoblar:</p>
        <ul className="mt-2 space-y-1">
          <li><strong className="text-gray-800">Admin:</strong> admin@wedding.uz · Admin1234</li>
          <li><strong className="text-gray-800">Owner:</strong> jasur01 · Owner1234</li>
          <li><strong className="text-gray-800">User:</strong> +998901234567 · User12345</li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Hisobingiz yo&apos;qmi?{' '}
        <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
          Ro&apos;yxatdan o&apos;ting
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-400">
        To&apos;yxona egasi?{' '}
        <Link to="/register/owner" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
          Owner ro&apos;yxati
        </Link>
      </p>
      <button>KKKKKKKKKKKKKKKKKK</button>
    </div>
  );
}
