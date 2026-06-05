import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueService } from '@/services/venue.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { VenueImageManager } from '@/components/venues/VenueImageManager';
import { SingersManager } from '@/components/venues/SingersManager';
import { MenuItemsManager } from '@/components/venues/MenuItemsManager';
import { CarsManager } from '@/components/venues/CarsManager';
import { KarnaySurnayManager } from '@/components/venues/KarnaySurnayManager';
import { VenueCalendar } from '@/components/venues/VenueCalendar';
import { Badge } from '@/components/ui/Badge';

const TABS = [
  { id: 'images', label: 'Rasmlar' },
  { id: 'singers', label: "Qo'shiqchilar" },
  { id: 'menu', label: 'Menyu' },
  { id: 'cars', label: 'Mashinalar' },
  { id: 'karnay', label: 'Karnay-surnay' },
  { id: 'calendar', label: 'Kalendar' },
];

export function VenueManagePage() {
  const { id } = useParams();
  const venueId = Number(id);
  const [venueName, setVenueName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('images');

  useEffect(() => {
    if (!id) return;
    venueService
      .getById(venueId)
      .then(({ data }) => {
        setVenueName(data.name);
        setStatus(data.status);
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, venueId]);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Settings className="h-7 w-7 text-brand-400" />
            {venueName}
          </span>
        }
        subtitle="To'yxonani to'liq boshqarish"
        action={
          <div className="flex gap-2">
            <Badge status={status} />
            <Link to={`/venues/${venueId}/edit`}>
              <Button variant="outline" size="sm">
                Asosiy ma&apos;lumot
              </Button>
            </Link>
          </div>
        }
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6">
        {tab === 'images' && <VenueImageManager venueId={venueId} />}
        {tab === 'singers' && <SingersManager venueId={venueId} />}
        {tab === 'menu' && <MenuItemsManager venueId={venueId} />}
        {tab === 'cars' && <CarsManager venueId={venueId} />}
        {tab === 'karnay' && <KarnaySurnayManager venueId={venueId} />}
        {tab === 'calendar' && <VenueCalendar venueId={venueId} mode="view" />}
      </div>
    </div>
  );
}
