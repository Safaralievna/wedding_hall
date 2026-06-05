const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { calculateBookingPrice } = require("../utils/bookingPrice");

const isPastDate = (dateString) => {
  const inputDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

const resolveExtraPrice = async (extra, venueId) => {
  if (!extra.type || extra.id === undefined || extra.id === null) {
    throw new ApiError(400, "Qo'shimcha xizmat formati noto'g'ri");
  }

  let query = null;
  if (extra.type === "singer") {
    query = "SELECT id, price FROM singers WHERE id = $1 AND venue_id = $2 LIMIT 1";
  } else if (extra.type === "karnay") {
    query =
      "SELECT venue_id AS id, price FROM karnay_surnay WHERE venue_id = $1 AND available = TRUE LIMIT 1";
  } else if (extra.type === "car") {
    query = "SELECT id, price FROM cars WHERE id = $1 AND venue_id = $2 LIMIT 1";
  } else if (extra.type === "menu") {
    query = "SELECT id, price FROM menu_items WHERE id = $1 AND venue_id = $2 LIMIT 1";
  } else {
    throw new ApiError(400, "Noto'g'ri extra type");
  }

  const params = extra.type === "karnay" ? [venueId] : [extra.id, venueId];
  const extraResult = await pool.query(query, params);
  const row = extraResult.rows[0];

  if (!row) {
    throw new ApiError(404, `${extra.type} topilmadi`);
  }

  return {
    type: extra.type,
    id: row.id,
    price: Number(row.price || 0),
  };
};

const getBookings = asyncHandler(async (req, res) => {
  const { role, id: userId } = req.user;
  const { venueId, districtId, status } = req.query;

  const values = [];
  const conditions = [];

  let baseQuery = `
    SELECT
      b.id,
      b.event_date,
      b.guest_count,
      b.total_price,
      b.advance_paid,
      b.status,
      b.created_at,
      v.id AS venue_id,
      v.name AS venue_name,
      v.district_id,
      d.name AS district_name,
      u.first_name,
      u.last_name,
      u.phone
    FROM bookings b
    JOIN venues v ON v.id = b.venue_id
    JOIN districts d ON d.id = v.district_id
    LEFT JOIN users u ON u.id = b.user_id
  `;

  if (role === "owner") {
    conditions.push(`v.owner_id = $${values.length + 1}`);
    values.push(userId);
  } else if (role === "user") {
    conditions.push(`b.user_id = $${values.length + 1}`);
    values.push(userId);
  }

  if (venueId) {
    conditions.push(`b.venue_id = $${values.length + 1}`);
    values.push(venueId);
  }

  if (districtId) {
    conditions.push(`v.district_id = $${values.length + 1}`);
    values.push(districtId);
  }

  if (status) {
    conditions.push(`b.status = $${values.length + 1}`);
    values.push(status);
  }

  if (conditions.length) {
    baseQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  baseQuery += ` ORDER BY b.event_date ASC, b.id DESC`;

  const result = await pool.query(baseQuery, values);
  res.json(result.rows);
});

const createBooking = asyncHandler(async (req, res) => {
  const { venueId, eventDate, guestCount, extras = [] } = req.body;
  const userId = req.user.id;

  if (!venueId || !eventDate || !guestCount) {
    throw new ApiError(400, "Majburiy maydonlar to'liq emas");
  }

  if (isPastDate(eventDate)) {
    throw new ApiError(400, "O'tgan sana uchun bron qilib bo'lmaydi");
  }

  const venueResult = await pool.query(
    `SELECT v.id, v.price, v.capacity, v.status FROM venues v WHERE v.id = $1 LIMIT 1`,
    [venueId]
  );

  const venue = venueResult.rows[0];
  if (!venue) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  if (venue.status !== "approved") {
    throw new ApiError(400, "Tasdiqlanmagan to'yxonaga bron qilib bo'lmaydi");
  }

  if (Number(guestCount) > Number(venue.capacity)) {
    throw new ApiError(400, "Stollar soni to'yxona sig'imidan katta");
  }

  const exists = await pool.query(
    `SELECT id FROM bookings
     WHERE venue_id = $1 AND event_date = $2 AND status != 'cancelled'
     LIMIT 1`,
    [venueId, eventDate]
  );

  if (exists.rows.length) {
    throw new ApiError(409, "Bu kunga bron allaqachon mavjud");
  }

  const extraDetails = [];
  for (const extra of extras) {
    extraDetails.push(await resolveExtraPrice(extra, venueId));
  }

  const { totalPrice, advancePaid } = calculateBookingPrice(
    venue.price,
    guestCount,
    extraDetails.map((item) => item.price)
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingResult = await client.query(
      `INSERT INTO bookings (venue_id, user_id, event_date, guest_count, total_price, advance_paid, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
       RETURNING *`,
      [venueId, userId, eventDate, guestCount, totalPrice, advancePaid]
    );

    const booking = bookingResult.rows[0];

    for (const extra of extraDetails) {
      await client.query(
        `INSERT INTO booking_extras (booking_id, extra_type, extra_id, price)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, extra.type, extra.id, extra.price]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Booking completed successfully",
      booking,
      payment: {
        totalPrice,
        advancePaid,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const result = await pool.query(
    `SELECT
      b.id,
      b.venue_id,
      v.name AS venue_name,
      v.owner_id,
      v.district_id,
      d.name AS district_name,
      b.user_id,
      u.first_name,
      u.last_name,
      u.phone,
      b.event_date,
      b.guest_count,
      b.total_price,
      b.advance_paid,
      b.status,
      b.created_at
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     JOIN districts d ON d.id = v.district_id
     LEFT JOIN users u ON u.id = b.user_id
     WHERE b.id = $1
     LIMIT 1`,
    [id]
  );

  const booking = result.rows[0];
  if (!booking) {
    throw new ApiError(404, "Bron topilmadi");
  }

  const allowed =
    role === "admin" ||
    booking.user_id === userId ||
    (role === "owner" && booking.owner_id === userId);

  if (!allowed) {
    throw new ApiError(403, "Bu bronni ko'rish huquqingiz yo'q");
  }

  const extrasResult = await pool.query(
    `SELECT id, extra_type, extra_id, price, created_at
     FROM booking_extras
     WHERE booking_id = $1
     ORDER BY id ASC`,
    [id]
  );

  res.json({
    ...booking,
    extras: extrasResult.rows,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  const bookingResult = await pool.query(
    `SELECT b.id, b.user_id, b.status, v.owner_id
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     WHERE b.id = $1
     LIMIT 1`,
    [id]
  );

  const booking = bookingResult.rows[0];
  if (!booking) {
    throw new ApiError(404, "Bron topilmadi");
  }

  if (booking.status === "cancelled") {
    throw new ApiError(400, "Bron allaqachon bekor qilingan");
  }

  const allowed =
    role === "admin" ||
    booking.user_id === userId ||
    booking.owner_id === userId;

  if (!allowed) {
    throw new ApiError(403, "Bu bronni bekor qilish huquqingiz yo'q");
  }

  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [id]
  );

  res.json({ message: "Bron bekor qilindi", booking: result.rows[0] });
});

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
};
