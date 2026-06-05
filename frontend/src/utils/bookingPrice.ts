export interface BookingExtraSelection {
  type: 'singer' | 'karnay' | 'car' | 'menu';
  price: number;
}

export const calculateBookingPrice = (
  tablePrice: number | string,
  tableCount: number,
  extras: BookingExtraSelection[] = []
) => {
  const baseTotal = Number(tablePrice) * tableCount;
  const extrasTotal = extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  const totalPrice = Number((baseTotal + extrasTotal).toFixed(2));
  const advancePaid = Number((totalPrice * 0.2).toFixed(2));

  return { baseTotal, extrasTotal, totalPrice, advancePaid };
};
