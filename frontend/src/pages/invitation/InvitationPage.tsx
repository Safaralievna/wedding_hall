import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { invitationService } from '@/services/invitation.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/utils/format';

export function InvitationPage() {
  const { slug } = useParams();
  const [invitation, setInvitation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slug) return;
    invitationService
      .getBySlug(slug)
      .then(({ data }) => setInvitation(data))
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const shareText = useMemo(() => {
    if (!invitation) return '';
    return `Sizni ${invitation.bride_name} va ${invitation.groom_name} to'yliga taklif qilamiz!\n
Joy: ${invitation.hall_name}, ${invitation.hall_address}\n
Sana: ${formatDate(invitation.event_date)} ${invitation.wedding_time}`;
  }, [invitation]);

  const captureInvitationBlob = async () => {
    if (!sectionRef.current) throw new Error('Taklifnoma topilmadi');

    const blob = await domtoimage.toBlob(sectionRef.current, {
      width: sectionRef.current.offsetWidth,
      height: sectionRef.current.offsetHeight,
      pixelRatio: 2,
      style: {
        backgroundColor: '#ffffff',
      },
    });

    if (!blob) {
      throw new Error('Rasm blobini yaratib bo‘lmadi');
    }

    return blob;
  };

  const handleShare = async () => {
    if (!invitation) return;

    const title = `${invitation.bride_name} & ${invitation.groom_name} - To'y taklifi`;
    const text = shareText;
    const url = window.location.href;

    if (navigator.share) {
      try {
        let shareFiles: File[] = [];

        if (navigator.canShare) {
          try {
            const blob = await captureInvitationBlob();
            const file = new File([blob], `${invitation.bride_name}_${invitation.groom_name}_taklifnoma.png`, {
              type: 'image/png',
            });
            if (navigator.canShare({ files: [file] })) {
              shareFiles = [file];
            }
          } catch (imageError) {
            console.warn('Image share preparation failed', imageError);
          }
        }

        if (shareFiles.length) {
          await navigator.share({ title, text, url, files: shareFiles });
          return;
        }

        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        console.warn('Web Share API failed', err);
      }
    }

    const encoded = encodeURIComponent(`${text}\n${url}`);
    const links = [
      {
        label: 'Telegram',
        url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encoded}`,
      },
      { label: 'WhatsApp', url: `https://wa.me/?text=${encoded}` },
      { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { label: 'Email', url: `mailto:?subject=${encodeURIComponent(title)}&body=${encoded}` },
    ];

    toast.custom(() => (
      <div className="rounded-2xl bg-white p-4 shadow-xl border border-border max-w-md">
        <p className="mb-3 text-sm font-semibold text-gray-900">Ulashish uchun linklar</p>
        <div className="space-y-2 text-sm text-gray-700">
          {links.map((item) => (
            <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="block text-rose-600 underline">
              {item.label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Agar sizning qurilmangiz rasm fayllarini qo'llab-quvvatlasa, mobil brauzerda "Ulashish" tugmasini bosib tekshiring.
        </p>
      </div>
    ));
  };

  const handleDownloadPdf = async () => {
    if (!invitation) return;
    setSaving(true);
    try {
      const blob = await captureInvitationBlob();
      const imageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.src = imageUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image load failed'));
      });

      const width = Math.ceil(image.width);
      const height = Math.ceil(image.height);
      const orientation = width >= height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
      pdf.addImage(image, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`${invitation.bride_name}_${invitation.groom_name}_taklifnoma.pdf`);
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error(error);
      toast.error('PDF yaratilishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!invitation) return;
    setSaving(true);
    try {
      const blob = await captureInvitationBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invitation.bride_name}_${invitation.groom_name}_taklifnoma.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Rasm yuklab olishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Taklif havolasi nusxalandi');
    } catch (err) {
      console.error(err);
      toast.error('Havolani nusxalash imkoni bo‘lmadi');
    }
  };

  if (loading) return <Spinner />;
  if (!invitation) {
    return <div className="mx-auto max-w-3xl p-6 text-center text-gray-700">Taklifnoma mavjud emas.</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-600">Maxsus taklifnoma</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">{invitation.bride_name} & {invitation.groom_name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleShare} disabled={saving}>Ulashish</Button>
            <Button variant="secondary" onClick={handleDownloadPdf} loading={saving}>PDF yuklab olish</Button>
            <Button variant="secondary" onClick={handleDownloadImage} loading={saving}>Rasm yuklab olish</Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[56px] border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-10 shadow-[0_35px_90px_rgba(251,207,232,0.25)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,207,232,0.45),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(248,159,177,0.28),transparent_32%)]" />
          <div className="pointer-events-none absolute left-10 top-10 h-36 w-36 rounded-full bg-rose-100/70 blur-3xl" />
          <div className="pointer-events-none absolute right-12 bottom-10 h-32 w-32 rounded-full bg-rose-200/70 blur-3xl" />
          <div ref={sectionRef} className="relative rounded-[48px] border border-white bg-white/95 p-10 shadow-xl">
            <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-rose-100/80 blur-3xl" />
            <div className="absolute right-0 top-16 h-20 w-20 rounded-full bg-rose-200/70 blur-3xl" />
            <div className="absolute left-8 bottom-10 h-20 w-20 rounded-full bg-rose-100/70 blur-3xl" />

            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs uppercase tracking-[0.55em] text-rose-500">Taklifnoma</p>
              <h1 className="mt-6 text-5xl font-serif font-semibold tracking-tight text-gray-900">{invitation.bride_name} <span className="text-rose-500">&</span> {invitation.groom_name}</h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-gray-600">Sizni hayotimizdagi eng muhim onlarni birga nishonlashga taklif qilamiz. Bu kun biz uchun juda qadrli, va siz bilan bo‘lishishni intiqlik bilan kutmoqdamiz.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-6 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Oy</p>
                <p className="mt-4 text-3xl font-semibold text-rose-600">{new Date(invitation.event_date).toLocaleString('uz-UZ', { month: 'long' }).toUpperCase()}</p>
              </div>
              <div className="rounded-[32px] border border-white bg-white p-6 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Kun</p>
                <p className="mt-4 text-5xl font-semibold text-gray-900">{new Date(invitation.event_date).getDate()}</p>
              </div>
              <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-6 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Vaqt</p>
                <p className="mt-4 text-3xl font-semibold text-gray-900">{invitation.wedding_time}</p>
              </div>
            </div>

            <div className="mt-10 rounded-[36px] border border-rose-100 bg-rose-50/90 p-8 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Manzil</p>
              <p className="mt-4 text-2xl font-semibold text-gray-900">{invitation.hall_name}</p>
              <p className="mt-2 text-sm text-gray-600">{invitation.hall_address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl rounded-[32px] border border-rose-200 bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Taklif havolasi</p>
            <p className="mt-3 break-all text-sm text-gray-700">{window.location.href}</p>
          </div>
          <Button variant="secondary" onClick={handleCopyLink}>Havolani nusxalash</Button>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Agar Telegram yoki boshqa ilovaga rasm sifatida ulashmoqchi bo‘lsangiz, avval “Rasm yuklab olish” tugmasini bosing va faylni qo‘lda yuboring.
        </p>
      </div>
    </>
  );
}
