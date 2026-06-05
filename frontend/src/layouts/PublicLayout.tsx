import { Outlet, Link, NavLink } from 'react-router-dom';
import { Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-gold-600' : 'text-stone-600 hover:text-stone-900'
  }`;

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard';

  return (
    <div className="gradient-mesh min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gold-400/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-stone-800">
            <Sparkles className="h-6 w-6 text-gold-500" />
            Wedding Hall
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Bosh sahifa
            </NavLink>
            <NavLink to="/venues" className={navLinkClass}>
              To&apos;yxonalar
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
                  <Button size="sm">Ro&apos;yxatdan o&apos;tish</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-gold-400/10 bg-white/60 py-8 text-center text-sm text-stone-500">
        © 2026 Wedding Hall Platform — Premium to&apos;yxona bron qilish
      </footer>
    </div>
  );
}
