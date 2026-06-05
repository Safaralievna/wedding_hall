import { Outlet, Link, NavLink } from 'react-router-dom';
import { Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-brand-400' : 'text-slate-400 hover:text-white'
  }`;

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'owner'
        ? '/owner'
        : '/dashboard';

  return (
    <div className="gradient-mesh min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="h-6 w-6 text-brand-400" />
            Wedding Hall
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Bosh sahifa
            </NavLink>
            <NavLink to="/venues" className={navLinkClass}>
              To'yxonalar
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button variant="secondary" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4" />
                    Kirish
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Ro'yxatdan o'tish</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
