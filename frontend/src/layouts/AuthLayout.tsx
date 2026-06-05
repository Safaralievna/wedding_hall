import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="gradient-mesh flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r border-white/5 bg-surface-900/50 p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Sparkles className="h-7 w-7 text-brand-400" />
          Wedding Hall
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Orzuingizdagi
            <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              to'yxonani toping
            </span>
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Premium platforma orqali eng yaxshi to'yxonalarni qidiring, bron qiling va
            unutilmas to'y tashkil qiling.
          </p>
        </div>
        <p className="text-sm text-slate-500">© 2026 Wedding Hall Platform</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
