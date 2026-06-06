import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Shield, Sparkles, Star } from 'lucide-react';
import { venueService } from '@/services/venue.service';
import { VenueCard } from '@/components/venues/VenueCard';
import { Button } from '@/components/ui/Button';
import { VenueGridSkeleton } from '@/components/ui/Skeleton';
import type { Venue } from '@/types';
import toast from 'react-hot-toast';

const HERO_IMAGE =
  'https://i.pinimg.com/736x/ea/a6/37/eaa637466777ac47de0dff4ae3135873.jpg';

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
      {/* Hero */}
      <section className="hero-gradient overflow-hidden">
        <div className="page-container py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-surface px-4 py-1.5 text-sm font-medium text-rose-600 shadow-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Premium to&apos;yxona platformasi
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]">
                Hayotingizning eng go&apos;zal kunini{' '}
                <span className="text-rose-500">mukammal joyda</span> nishonlang
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600">
                O&apos;zbekiston bo&apos;ylab tasdiqlangan premium to&apos;yxonalar. Qulay qidiruv,
                onlayn bron va shaffof narxlar — barchasi bir joyda.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
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

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold-400 text-gold-500" />
                  24+ premium to&apos;yxona
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-rose-500" />
                  Tasdiqlangan joylar
                </span>
              </div>
            </div>

            <div className="relative animate-fade-up [animation-delay:150ms]">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl border border-rose-400/20 bg-rose-400/5" />
                <div className="relative overflow-hidden rounded-3xl border border-border shadow-xl shadow-gray-900/10">
                  <img
                    src={HERO_IMAGE}
                    alt="Kelin va kuyov — premium to'y"
                    className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-surface px-5 py-4 shadow-lg shadow-gray-900/10">
                  <p className="font-display text-2xl font-semibold text-gray-900">500+</p>
                  <p className="text-sm text-gray-500">Muvaffaqiyatli to&apos;y</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface py-16">
        <div className="page-container">
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Tasdiqlangan', desc: "Har bir to'yxona admin tomonidan tekshiriladi" },
              { icon: Heart, title: 'Premium dizayn', desc: "Zamonaviy va nafis to'yxonalar" },
              { icon: Search, title: 'Qulay qidiruv', desc: "Tuman va narx bo'yicha filter" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-cream-100 shadow-sm">
                  <Icon className="h-6 w-6 text-rose-500" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="page-container py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="heading-display text-2xl sm:text-3xl">Mashhur to&apos;yxonalar</h2>
            <p className="mt-2 text-gray-500">Eng ko&apos;p tanlangan premium joylar</p>
          </div>
          <Link
            to="/venues"
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 transition-colors hover:text-rose-500"
          >
            Barchasini ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <VenueGridSkeleton count={6} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="page-container pb-20">
        <div className="rounded-3xl border border-border bg-gray-900 px-8 py-14 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            To&apos;yingiz uchun ideal joyni toping
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Hoziroq ro&apos;yxatdan o&apos;ting va eng yaxshi to&apos;yxonalarni qidiring.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/venues">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-cream-100">
                To&apos;yxonalarni ko&apos;rish
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Ro&apos;yxatdan o&apos;tish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
