import { Outlet, Link, NavLink } from 'react-router-dom';
import { Sparkles, LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors duration-200 ${
    isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
  }`;

export function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard';

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="page-container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-gray-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10">
              <Sparkles className="h-4 w-4 text-rose-500" aria-hidden="true" />
            </span>
            Wedding Hall
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Asosiy navigatsiya">
            <NavLink to="/" className={navLinkClass} end>
              Bosh sahifa
            </NavLink>
            <NavLink to="/venues" className={navLinkClass}>
              To&apos;yxonalar
            </NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
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

          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-cream-200 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3" aria-label="Mobil navigatsiya">
              <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>
                Bosh sahifa
              </NavLink>
              <NavLink to="/venues" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                To&apos;yxonalar
              </NavLink>
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated ? (
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Panel
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Kirish
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full">
                        Ro&apos;yxatdan o&apos;tish
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border bg-surface">
        <div className="page-container py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-gray-900">
                <Sparkles className="h-5 w-5 text-rose-500" />
                Wedding Hall
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                O&apos;zbekistonning eng yaxshi to&apos;yxonalarini topish va bron qilish uchun premium platforma.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Sahifalar</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-500">
                <li><Link to="/venues" className="hover:text-gray-800 transition-colors">To&apos;yxonalar</Link></li>
                <li><Link to="/login" className="hover:text-gray-800 transition-colors">Kirish</Link></li>
                <li><Link to="/register" className="hover:text-gray-800 transition-colors">Ro&apos;yxatdan o&apos;tish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Aloqa</h4>
              <p className="mt-3 text-sm text-gray-500">info@weddinghall.uz</p>
              <p className="text-sm text-gray-500">+998 90 123 45 67</p>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-gray-400">
            © 2026 Wedding Hall Platform. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
