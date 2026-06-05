import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Shield, Sparkles } from 'lucide-react';
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
      <section className="hero-pattern relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-blush-400/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-gold-400/30 bg-white/80 px-4 py-1.5 text-sm font-medium text-gold-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Premium to&apos;yxona platformasi
          </span>
          <h1 className="mt-6 animate-fade-up font-display text-4xl font-extrabold tracking-tight text-stone-800 sm:text-6xl [animation-delay:100ms]">
            Orzuingizdagi to&apos;yxonani{' '}
            <span className="bg-gradient-to-r from-gold-500 via-gold-400 to-blush-400 bg-clip-text text-transparent">
              bir joyda
            </span>{' '}
            toping
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-stone-600 [animation-delay:200ms]">
            O&apos;zbekiston bo&apos;ylab tasdiqlangan premium to&apos;yxonalar. Qulay qidiruv,
            onlayn bron va shaffof narxlar.
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4 [animation-delay:300ms]">
            <Link to="/venues">
              <Button size="lg">
                <Search className="h-5 w-5" />
                To&apos;yxonalarni ko&apos;rish
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Bepul ro&apos;yxatdan o&apos;tish
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gold-400/10 bg-white/60 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Shield, title: 'Tasdiqlangan', desc: "Har bir to'yxona admin tomonidan tekshiriladi" },
            { icon: Heart, title: 'Premium dizayn', desc: "Zamonaviy va nafis to'yxonalar" },
            { icon: Search, title: 'Qulay qidiruv', desc: "Tuman va narx bo'yicha filter" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/10">
                <Icon className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="font-display font-semibold text-stone-800">{title}</h3>
              <p className="mt-1 text-sm text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-800">Mashhur to&apos;yxonalar</h2>
            <p className="mt-1 text-stone-500">Eng ko&apos;p tanlangan joylar</p>
          </div>
          <Link to="/venues" className="text-sm font-medium text-gold-600 hover:text-gold-500">
            Barchasini ko&apos;rish →
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
