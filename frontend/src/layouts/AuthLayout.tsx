import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="gradient-mesh flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r border-gold-400/10 bg-white/60 p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-stone-800">
          <Sparkles className="h-7 w-7 text-gold-500" />
          Wedding Hall
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight text-stone-800">
            Orzuingizdagi
            <span className="block bg-gradient-to-r from-gold-500 to-blush-400 bg-clip-text text-transparent">
              to&apos;yxonani toping
            </span>
          </h2>
          <p className="mt-4 max-w-md text-stone-600">
            Premium platforma orqali eng yaxshi to&apos;yxonalarni qidiring, bron qiling va
            unutilmas to&apos;y tashkil qiling.
          </p>
        </div>
        <p className="text-sm text-stone-400">© 2026 Wedding Hall Platform</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
