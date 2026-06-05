const calculateBookingPrice = (tablePrice, tableCount, extrasPrices = []) => {
  const baseTotal = Number(tablePrice) * Number(tableCount);
  const extrasTotal = extrasPrices.reduce((sum, price) => sum + Number(price || 0), 0);
  const totalPrice = Number((baseTotal + extrasTotal).toFixed(2));
  const advancePaid = Number((totalPrice * 0.2).toFixed(2));

  return { baseTotal, extrasTotal, totalPrice, advancePaid };
};

module.exports = { calculateBookingPrice };
