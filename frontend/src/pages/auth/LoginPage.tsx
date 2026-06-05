import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <Sparkles className="h-6 w-6 text-brand-400" />
        <span className="font-bold text-white">Wedding Hall</span>
      </div>
      <h1 className="text-2xl font-bold text-white">Hisobingizga kiring</h1>
      <p className="mt-2 text-slate-400">
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
        />
        <Input
          label="Parol"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Kirish
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Dev hisoblar (bir marta backendda):</p>
        <p className="mt-2">
          <code className="text-brand-300">npm run seed:dev-auth</code> — keyin:
        </p>
        <ul className="mt-2 space-y-1">
          <li>
            <strong className="text-white">Admin:</strong> admin@wedding.uz · Admin1234
          </li>
          <li>
            <strong className="text-white">Owner:</strong> jasur01 · Owner1234
          </li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Hisobingiz yo'qmi?{' '}
        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
          Ro'yxatdan o'ting
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        To'yxona egasi?{' '}
        <Link to="/register/owner" className="text-brand-400 hover:text-brand-300">
          Owner ro'yxati
        </Link>
      </p>
    </div>
  );
}
