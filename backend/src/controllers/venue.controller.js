const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const DEFAULT_VENUE_IMAGES = [
  "https://media.weddingz.in/images/16ab8276a8bfa26550f679e8e6963687/best-wedding-reception-halls-in-patna-you-will-absolutely-fall-in-love-with.jpg",
  "https://www.wedding-spot.com/blog/sites/wsblog/files/styles/webp_desktop/public/images/migrated/78-Fitroy%2Bwedding%2Bvenue.jpg.webp?itok=vg-DX6bK",
  "https://www.koronakarkonoszy.pl/blog/wp-content/uploads/2021/07/sala_balowa_vintage-1.jpg.webp",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  "https://3.imimg.com/data3/BE/ER/MY-12637145/images-ic-500x500.jpg",
];

const venueSelectBase = `
  SELECT
    v.id,
    v.name,
    v.district_id,
    d.name AS district_name,
    v.address,
    v.capacity,
    v.price,
    v.phone,
    v.status,
    v.owner_id,
    v.created_at,
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', vi.id,
          'url', vi.url,
          'is_primary', vi.is_primary
        )
      ) FILTER (WHERE vi.id IS NOT NULL),
      '[]'
    ) AS images
  FROM venues v
  JOIN districts d ON d.id = v.district_id
  LEFT JOIN venue_images vi ON vi.venue_id = v.id
`;

const isUploadUrl = (url) => typeof url === 'string' && url.includes('/uploads/');

const getDefaultVenueImages = (venueId) => {
  const imageCount = 2;
  return Array.from({ length: imageCount }, (_, index) => ({
    id: null,
    url: DEFAULT_VENUE_IMAGES[(venueId + index) % DEFAULT_VENUE_IMAGES.length],
    is_primary: index === 0,
  }));
};

const attachDefaultImages = (venue) => {
  const images = Array.isArray(venue.images) ? venue.images : [];
  const hasValidExternal = images.some((img) => img && typeof img.url === 'string' && img.url.trim() && !isUploadUrl(img.url));

  return {
    ...venue,
    images: hasValidExternal ? images : getDefaultVenueImages(venue.id),
  };
};

const buildVenueFilters = (query) => {
  const values = [];
  const conditions = [];

  if (query.search) {
    values.push(`%${query.search.toLowerCase()}%`);
    conditions.push(`LOWER(v.name) LIKE $${values.length}`);
  }

  if (query.districtId) {
    values.push(query.districtId);
    conditions.push(`v.district_id = $${values.length}`);
  }

  if (query.status) {
    values.push(query.status);
    conditions.push(`v.status = $${values.length}`);
  }

  if (query.minPrice) {
    values.push(query.minPrice);
    conditions.push(`v.price >= $${values.length}`);
  }

  if (query.maxPrice) {
    values.push(query.maxPrice);
    conditions.push(`v.price <= $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { values, whereClause };
};

const getVenues = asyncHandler(async (req, res) => {
  const query = { ...req.query };

  if (!query.status) {
    query.status = "approved";
  }

  const { values, whereClause } = buildVenueFilters(query);
  const sortField = req.query.sortBy === "capacity" ? "v.capacity" : "v.price";
  const sortOrder = req.query.order === "asc" ? "ASC" : "DESC";

  const sql = `
    ${venueSelectBase}
    ${whereClause}
    GROUP BY v.id, d.id
    ORDER BY ${sortField} ${sortOrder}, v.id DESC
  `;

  const result = await pool.query(sql, values);
  const venues = result.rows.map(attachDefaultImages);
  res.json(venues);
});

const getAdminVenues = asyncHandler(async (req, res) => {
  const { values, whereClause } = buildVenueFilters(req.query);
  const sortField = req.query.sortBy === "capacity" ? "v.capacity" : "v.price";
  const sortOrder = req.query.order === "asc" ? "ASC" : "DESC";

  const sql = `
    ${venueSelectBase}
    ${whereClause}
    GROUP BY v.id, d.id
    ORDER BY ${sortField} ${sortOrder}, v.id DESC
  `;

  const result = await pool.query(sql, values);
  const venues = result.rows.map(attachDefaultImages);
  res.json(venues);
});

const getOwnerVenues = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { values, whereClause } = buildVenueFilters({ ...req.query, ownerId });
  const sortField = req.query.sortBy === "capacity" ? "v.capacity" : "v.price";
  const sortOrder = req.query.order === "asc" ? "ASC" : "DESC";

  const sql = `
    ${venueSelectBase}
    ${whereClause ? `${whereClause} AND v.owner_id = $${values.length + 1}` : `WHERE v.owner_id = $${values.length + 1}`}
    GROUP BY v.id, d.id
    ORDER BY ${sortField} ${sortOrder}, v.id DESC
  `;

  values.push(ownerId);

  const result = await pool.query(sql, values);
  const venues = result.rows.map(attachDefaultImages);
  res.json(venues);
});

const getVenueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
      ${venueSelectBase}
      WHERE v.id = $1
      GROUP BY v.id, d.id
      LIMIT 1
    `,
    [id]
  );

  const venueRow = result.rows[0];
  if (!venueRow) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  const venue = attachDefaultImages(venueRow);

  const [singers, car, menuItems, bookings] = await Promise.all([
    pool.query("SELECT id, name, price, image FROM singers WHERE venue_id = $1 ORDER BY id DESC", [id]),
    pool.query("SELECT id, available, price FROM karnay_surnay WHERE venue_id = $1", [id]),
    pool.query(
      "SELECT id, name, price, image FROM menu_items WHERE venue_id = $1 ORDER BY id DESC",
      [id]
    ),
    pool.query(
      `
        SELECT
          b.id,
          b.event_date,
          b.guest_count,
          b.status
        FROM bookings b
        WHERE b.venue_id = $1 AND b.status != 'cancelled'
        ORDER BY b.event_date DESC
      `,
      [id]
    ),
  ]);

  res.json({
    ...venue,
    singers: singers.rows,
    karnay_surnay: car.rows[0] || null,
    menu_items: menuItems.rows,
    bookings: bookings.rows,
  });
});

const createVenue = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  const { name, districtId, address, capacity, price, phone, ownerId = null } = req.body;

  if (!name || !districtId || !address || !capacity || !price || !phone) {
    throw new ApiError(400, "Majburiy maydonlar to'liq emas");
  }

  const districtCheck = await pool.query("SELECT id FROM districts WHERE id = $1", [districtId]);
  if (!districtCheck.rows.length) {
    throw new ApiError(400, "Rayon topilmadi");
  }

  let venueOwnerId = null;

  if (currentUser.role === "owner") {
    venueOwnerId = currentUser.id;
  } else if (ownerId) {
    const ownerCheck = await pool.query("SELECT id, role FROM users WHERE id = $1", [ownerId]);
    if (!ownerCheck.rows.length || ownerCheck.rows[0].role !== "owner") {
      throw new ApiError(400, "ownerId faqat owner bo'lishi mumkin");
    }
    venueOwnerId = ownerId;
  }

  const result = await pool.query(
    `INSERT INTO venues (name, district_id, address, capacity, price, phone, status, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
     RETURNING *`,
    [name, districtId, address, capacity, price, phone, venueOwnerId]
  );

  res.status(201).json({
    message: "To'yxona yaratildi",
    venue: result.rows[0],
  });
});

const updateVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  const existingVenue = await pool.query("SELECT id, owner_id FROM venues WHERE id = $1 LIMIT 1", [id]);
  const venue = existingVenue.rows[0];

  if (!venue) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  if (currentUser.role === "owner" && venue.owner_id !== currentUser.id) {
    throw new ApiError(403, "Faqat o'zingizning to'yxonangizni tahrirlay olasiz");
  }

  if (currentUser.role === "owner") {
    delete req.body.status;
    delete req.body.ownerId;
  }

  const fields = ["name", "districtId", "address", "capacity", "price", "phone", "status", "ownerId", "description"];
  const updates = [];
  const values = [];

  const mapping = {
    districtId: "district_id",
    ownerId: "owner_id",
  };

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      const column = mapping[field] || field;
      updates.push(`${column} = $${values.length}`);
    }
  });

  if (!updates.length) {
    throw new ApiError(400, "Yangilash uchun ma'lumot yo'q");
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE venues SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );

  res.json({ message: "To'yxona yangilandi", venue: result.rows[0] });
});

const deleteVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  const existingVenue = await pool.query("SELECT id, owner_id FROM venues WHERE id = $1 LIMIT 1", [id]);
  const venue = existingVenue.rows[0];

  if (!venue) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  if (currentUser.role === "owner" && venue.owner_id !== currentUser.id) {
    throw new ApiError(403, "Faqat o'zingizning to'yxonangizni o'chira olasiz");
  }

  const result = await pool.query("DELETE FROM venues WHERE id = $1 RETURNING id", [id]);

  res.json({ message: "To'yxona o'chirildi" });
});

const approveVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE venues SET status = 'approved' WHERE id = $1 RETURNING *",
    [id]
  );

  if (!result.rows[0]) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  res.json({ message: "To'yxona tasdiqlandi", venue: result.rows[0] });
});

const getVenueCalendar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "startDate va endDate majburiy");
  }

  const venueResult = await pool.query("SELECT id, status FROM venues WHERE id = $1 LIMIT 1", [id]);
  const venue = venueResult.rows[0];

  if (!venue) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  const bookingsResult = await pool.query(
    `SELECT event_date, status
     FROM bookings
     WHERE venue_id = $1
       AND event_date BETWEEN $2 AND $3`,
    [id, startDate, endDate]
  );

  const bookedMap = new Map(
    bookingsResult.rows.map((row) => {
      const eventDate = typeof row.event_date === "string"
        ? row.event_date
        : row.event_date.toISOString().slice(0, 10);

      return [eventDate, row.status];
    })
  );

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const dateKey = cursor.toISOString().slice(0, 10);
    let status = "free";

    if (cursor < today) {
      status = "past";
    } else if (bookedMap.has(dateKey)) {
      const bookingStatus = bookedMap.get(dateKey);
      status = bookingStatus === "cancelled" ? "free" : "booked";
    }

    days.push({
      date: dateKey,
      status,
    });
  }

  res.json({
    venueId: venue.id,
    range: { startDate, endDate },
    days,
  });
});

module.exports = {
  getVenues,
  getAdminVenues,
  getOwnerVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  approveVenue,
  getVenueCalendar,
};