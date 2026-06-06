import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fullName } from '@/utils/format';
import type { UserRole } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['user'] },
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner'] },
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { to: '/venues', label: "To'yxonalar", icon: Building2, roles: ['user', 'owner', 'admin'] },
  { to: '/my-venues', label: "Mening to'yxonalarim", icon: Building2, roles: ['owner'] },
  { to: '/admin/venues', label: 'Barcha to\'yxonalar', icon: Building2, roles: ['admin'] },
  { to: '/bookings', label: 'Bronlar', icon: CalendarDays, roles: ['user', 'owner', 'admin'] },
  { to: '/admin/bookings', label: 'Barcha bronlar', icon: CalendarDays, roles: ['admin'] },
  { to: '/admin/owners', label: 'Egalari', icon: Users, roles: ['admin'] },
];

export function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = navItems.filter((item) => hasRole(...item.roles));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-gray-900 text-white shadow-sm'
        : 'text-gray-600 hover:bg-cream-200 hover:text-gray-900'
    }`;

  return (
    <div className="flex min-h-screen bg-cream-50">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Yopish"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-gray-900">
            <Sparkles className="h-5 w-5 text-rose-500" />
            Wedding Hall
          </Link>
          <button
            type="button"
            className="text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Menyuni yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Panel navigatsiyasi">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard') || item.to === '/admin' || item.to === '/owner'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 rounded-xl border border-border bg-cream-100 px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {fullName(user?.first_name, user?.last_name)}
            </p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Chiqish
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-4 lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-cream-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menyuni ochish"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/venues" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
            Saytga qaytish →
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
