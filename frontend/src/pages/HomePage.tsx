import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, Zap } from 'lucide-react';
import { venueService } from '@/services/venue.service';
import { VenueCard } from '@/components/venues/VenueCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Venue } from '@/types';
import toast from 'react-hot-toast';

export function HomePage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venueService
      .getAll({ order: 'desc' })
      .then(({ data }) => setVenues(data.slice(0, 6)))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300">
            <Zap className="h-4 w-4" />
            Premium to'yxona platformasi
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Eng chiroyli to'yxonani{' '}
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-400 bg-clip-text text-transparent">
              bir joyda
            </span>{' '}
            toping
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            O'zbekiston bo'ylab tasdiqlangan to'yxonalar. Qulay qidiruv, onlayn bron va
            shaffof narxlar.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/venues">
              <Button size="lg">
                <Search className="h-5 w-5" />
                To'yxonalarni ko'rish
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Bepul ro'yxatdan o'tish
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-surface-900/50 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Shield, title: 'Tasdiqlangan', desc: 'Har bir to\'yxona admin tomonidan tekshiriladi' },
            { icon: Zap, title: 'Tez bron', desc: 'Bir necha daqiqada onlayn band qiling' },
            { icon: Search, title: 'Qulay qidiruv', desc: 'Rayon va narx bo\'yicha filter' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10">
                <Icon className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Mashhur to'yxonalar</h2>
            <p className="mt-1 text-slate-400">Eng ko'p tanlangan joylar</p>
          </div>
          <Link to="/venues" className="text-sm font-medium text-brand-400 hover:text-brand-300">
            Barchasini ko'rish →
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
