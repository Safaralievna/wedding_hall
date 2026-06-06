import { useState } from 'react';
import { CreditCard, Lock, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/utils/format';

interface PaymentModalProps {
  open: boolean;
  totalPrice: number;
  advancePaid: number;
  onClose: () => void;
  onPay: () => Promise<void>;
}

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export function PaymentModal({ open, totalPrice, advancePaid, onClose, onPay }: PaymentModalProps) {
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (cardHolder.trim().length < 2) next.cardHolder = "Karta egasi nomi to'liq emas";
    if (cardNumber.replace(/\s/g, '').length !== 16) next.cardNumber = '16 xonali karta raqami kerak';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) next.expiry = 'MM/YY formatida kiriting';
    if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'CVV 3 yoki 4 raqamdan iborat';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onPay();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Yopish"
      />
      <div className="relative w-full max-w-md animate-fade-up surface-card-elevated p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-cream-200 hover:text-gray-700"
          aria-label="Yopish"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50">
            <CreditCard className="h-6 w-6 text-rose-600" aria-hidden="true" />
          </div>
          <div>
            <h2 id="payment-title" className="font-display text-xl font-semibold text-gray-900">To&apos;lov</h2>
            <p className="text-sm text-gray-500">Demo to&apos;lov tizimi</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-cream-100 p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Jami summa</span>
            <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>Oldindan to&apos;lov (20%)</span>
            <span className="font-semibold text-rose-600">{formatPrice(advancePaid)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Card Holder Name"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="JOHN DOE"
            error={errors.cardHolder}
          />
          <Input
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            error={errors.cardNumber}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiration Date"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              error={errors.expiry}
            />
            <Input
              label="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              type="password"
              error={errors.cvv}
            />
          </div>
        </div>

        <Button type="button" className="mt-6 w-full" size="lg" loading={loading} onClick={handlePay}>
          <Lock className="h-4 w-4" aria-hidden="true" />
          Pay Now
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400">
          Bu demo tizim. Haqiqiy pul yechilmaydi.
        </p>
      </div>
    </div>
  );
}
