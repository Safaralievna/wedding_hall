import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AUTH_IMAGE =
  'https://www.idaliaphotography.com/wp-content/uploads/2021/08/ballroom-at-the-ben-wedding_0038.jpg';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={AUTH_IMAGE}
          alt="Premium to'yxona"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold text-white">
            <Sparkles className="h-6 w-6 text-rose-400" />
            Wedding Hall
          </Link>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight text-white">
              Orzuingizdagi
              <span className="mt-1 block text-rose-300">to&apos;yxonani toping</span>
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-300">
              Premium platforma orqali eng yaxshi to&apos;yxonalarni qidiring, bron qiling va
              unutilmas to&apos;y tashkil qiling.
            </p>
          </div>
          <p className="text-sm text-gray-400">© 2026 Wedding Hall Platform</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Sparkles className="h-6 w-6 text-rose-500" />
            <span className="font-display text-xl font-semibold text-gray-900">Wedding Hall</span>
          </div>
          <div className="surface-card-elevated p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
