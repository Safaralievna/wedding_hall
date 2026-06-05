const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const uploadBaseUrl = (req) => `${req.protocol}://${req.get("host")}/uploads`;

const getVenueAccess = async (venueId, currentUser) => {
  const result = await pool.query("SELECT id, owner_id FROM venues WHERE id = $1 LIMIT 1", [venueId]);
  const venue = result.rows[0];

  if (!venue) {
    throw new ApiError(404, "To'yxona topilmadi");
  }

  if (currentUser.role === "owner" && venue.owner_id !== currentUser.id) {
    throw new ApiError(403, "Faqat o'zingizning to'yxonangizni boshqara olasiz");
  }

  return venue;
};

const toFileUrl = (req, filename) => `${uploadBaseUrl(req)}/${filename}`;

const deleteLocalFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    const filename = fileUrl.split("/").pop();
    if (!filename) return;

    const filePath = path.join(__dirname, "..", "..", "uploads", filename);
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore missing file errors.
  }
};

const listVenueImages = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const result = await pool.query(
    "SELECT id, venue_id, url, is_primary, created_at FROM venue_images WHERE venue_id = $1 ORDER BY is_primary DESC, id DESC",
    [venueId]
  );

  res.json(result.rows);
});

const addVenueImages = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  if (!req.files || !req.files.length) {
    throw new ApiError(400, "Hech qanday rasm yuborilmadi");
  }

  const primaryIndex = req.body.primaryIndex ? Number(req.body.primaryIndex) : 0;
  const inserted = [];

  for (let index = 0; index < req.files.length; index += 1) {
    const file = req.files[index];
    const url = toFileUrl(req, file.filename);
    const isPrimary = index === primaryIndex;

    const result = await pool.query(
      `INSERT INTO venue_images (venue_id, url, is_primary)
       VALUES ($1, $2, $3)
       RETURNING id, venue_id, url, is_primary, created_at`,
      [venueId, url, isPrimary]
    );

    inserted.push(result.rows[0]);
  }

  if (!inserted.some((item) => item.is_primary)) {
    const primary = inserted[0];
    await pool.query("UPDATE venue_images SET is_primary = TRUE WHERE id = $1", [primary.id]);
    inserted[0].is_primary = true;
  }

  res.status(201).json({
    message: "Rasmlar qo'shildi",
    images: inserted,
  });
});

const deleteVenueImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const currentUser = req.user;

  const result = await pool.query(
    `SELECT vi.id, vi.url, vi.venue_id, v.owner_id
     FROM venue_images vi
     JOIN venues v ON v.id = vi.venue_id
     WHERE vi.id = $1
     LIMIT 1`,
    [imageId]
  );

  const image = result.rows[0];
  if (!image) {
    throw new ApiError(404, "Rasm topilmadi");
  }

  if (currentUser.role === "owner" && image.owner_id !== currentUser.id) {
    throw new ApiError(403, "Faqat o'zingizning to'yxonangiz rasmini o'chira olasiz");
  }

  await pool.query("DELETE FROM venue_images WHERE id = $1", [imageId]);
  await deleteLocalFile(image.url);

  res.json({ message: "Rasm o'chirildi" });
});

const setPrimaryVenueImage = asyncHandler(async (req, res) => {
  const { venueId, imageId } = req.params;
  const currentUser = req.user;

  await getVenueAccess(venueId, currentUser);

  await pool.query("UPDATE venue_images SET is_primary = FALSE WHERE venue_id = $1", [venueId]);

  const result = await pool.query(
    "UPDATE venue_images SET is_primary = TRUE WHERE id = $1 AND venue_id = $2 RETURNING id, venue_id, url, is_primary, created_at",
    [imageId, venueId]
  );

  if (!result.rows[0]) {
    throw new ApiError(404, "Rasm topilmadi");
  }

  res.json({ message: "Asosiy rasm yangilandi", image: result.rows[0] });
});

const listSingers = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const result = await pool.query(
    "SELECT id, venue_id, name, price, image, created_at FROM singers WHERE venue_id = $1 ORDER BY id DESC",
    [venueId]
  );
  res.json(result.rows);
});

const createSinger = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const { name, price } = req.body;
  if (!name || price === undefined) {
    throw new ApiError(400, "Ism va narx majburiy");
  }

  const image = req.file ? toFileUrl(req, req.file.filename) : null;
  const result = await pool.query(
    `INSERT INTO singers (venue_id, name, price, image)
     VALUES ($1, $2, $3, $4)
     RETURNING id, venue_id, name, price, image, created_at`,
    [venueId, name, price, image]
  );

  res.status(201).json({ message: "Honanda qo'shildi", singer: result.rows[0] });
});

const updateSinger = asyncHandler(async (req, res) => {
  const { venueId, singerId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM singers WHERE id = $1 AND venue_id = $2", [singerId, venueId]);
  const singer = existing.rows[0];
  if (!singer) {
    throw new ApiError(404, "Honanda topilmadi");
  }

  const updates = [];
  const values = [];
  const fields = ["name", "price"];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      updates.push(`${field} = $${values.length}`);
    }
  });

  if (req.file) {
    const image = toFileUrl(req, req.file.filename);
    values.push(image);
    updates.push(`image = $${values.length}`);
    await deleteLocalFile(singer.image);
  }

  if (!updates.length) {
    throw new ApiError(400, "Yangilash uchun ma'lumot yo'q");
  }

  values.push(singerId, venueId);

  const result = await pool.query(
    `UPDATE singers SET ${updates.join(", ")}
     WHERE id = $${values.length - 1} AND venue_id = $${values.length}
     RETURNING id, venue_id, name, price, image, created_at`,
    values
  );

  res.json({ message: "Honanda yangilandi", singer: result.rows[0] });
});

const deleteSinger = asyncHandler(async (req, res) => {
  const { venueId, singerId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM singers WHERE id = $1 AND venue_id = $2", [singerId, venueId]);
  const singer = existing.rows[0];
  if (!singer) {
    throw new ApiError(404, "Honanda topilmadi");
  }

  await pool.query("DELETE FROM singers WHERE id = $1 AND venue_id = $2", [singerId, venueId]);
  await deleteLocalFile(singer.image);

  res.json({ message: "Honanda o'chirildi" });
});

const getKarnaySurnay = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const result = await pool.query(
    "SELECT id, venue_id, available, price, created_at FROM karnay_surnay WHERE venue_id = $1 LIMIT 1",
    [venueId]
  );

  res.json(result.rows[0] || null);
});

const upsertKarnaySurnay = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const { available, price } = req.body;
  if (available === undefined) {
    throw new ApiError(400, "available majburiy");
  }

  if (available && price === undefined) {
    throw new ApiError(400, "Mavjud bo'lsa price ham kerak");
  }

  const result = await pool.query(
    `INSERT INTO karnay_surnay (venue_id, available, price)
     VALUES ($1, $2, $3)
     ON CONFLICT (venue_id)
     DO UPDATE SET available = EXCLUDED.available, price = EXCLUDED.price
     RETURNING id, venue_id, available, price, created_at`,
    [venueId, available, available ? price : null]
  );

  res.json({ message: "Karnay-surnay saqlandi", item: result.rows[0] });
});

const listMenuItems = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const result = await pool.query(
    "SELECT id, venue_id, name, image, created_at FROM menu_items WHERE venue_id = $1 ORDER BY id DESC",
    [venueId]
  );
  res.json(result.rows);
});

const createMenuItem = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Nomi majburiy");
  }

  const image = req.file ? toFileUrl(req, req.file.filename) : null;
  const result = await pool.query(
    `INSERT INTO menu_items (venue_id, name, image)
     VALUES ($1, $2, $3)
     RETURNING id, venue_id, name, image, created_at`,
    [venueId, name, image]
  );

  res.status(201).json({ message: "Menu qo'shildi", menuItem: result.rows[0] });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { venueId, menuItemId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM menu_items WHERE id = $1 AND venue_id = $2", [menuItemId, venueId]);
  const menuItem = existing.rows[0];
  if (!menuItem) {
    throw new ApiError(404, "Menu topilmadi");
  }

  const updates = [];
  const values = [];

  if (req.body.name !== undefined) {
    values.push(req.body.name);
    updates.push(`name = $${values.length}`);
  }

  if (req.file) {
    const image = toFileUrl(req, req.file.filename);
    values.push(image);
    updates.push(`image = $${values.length}`);
    await deleteLocalFile(menuItem.image);
  }

  if (!updates.length) {
    throw new ApiError(400, "Yangilash uchun ma'lumot yo'q");
  }

  values.push(menuItemId, venueId);

  const result = await pool.query(
    `UPDATE menu_items SET ${updates.join(", ")}
     WHERE id = $${values.length - 1} AND venue_id = $${values.length}
     RETURNING id, venue_id, name, image, created_at`,
    values
  );

  res.json({ message: "Menu yangilandi", menuItem: result.rows[0] });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { venueId, menuItemId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM menu_items WHERE id = $1 AND venue_id = $2", [menuItemId, venueId]);
  const menuItem = existing.rows[0];
  if (!menuItem) {
    throw new ApiError(404, "Menu topilmadi");
  }

  await pool.query("DELETE FROM menu_items WHERE id = $1 AND venue_id = $2", [menuItemId, venueId]);
  await deleteLocalFile(menuItem.image);

  res.json({ message: "Menu o'chirildi" });
});

const listCars = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const result = await pool.query(
    "SELECT id, venue_id, brand, price, image, created_at FROM cars WHERE venue_id = $1 ORDER BY id DESC",
    [venueId]
  );
  res.json(result.rows);
});

const createCar = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const { brand, price } = req.body;
  if (!brand || price === undefined) {
    throw new ApiError(400, "Brand va price majburiy");
  }

  const image = req.file ? toFileUrl(req, req.file.filename) : null;
  const result = await pool.query(
    `INSERT INTO cars (venue_id, brand, price, image)
     VALUES ($1, $2, $3, $4)
     RETURNING id, venue_id, brand, price, image, created_at`,
    [venueId, brand, price, image]
  );

  res.status(201).json({ message: "Mashina qo'shildi", car: result.rows[0] });
});

const updateCar = asyncHandler(async (req, res) => {
  const { venueId, carId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM cars WHERE id = $1 AND venue_id = $2", [carId, venueId]);
  const car = existing.rows[0];
  if (!car) {
    throw new ApiError(404, "Mashina topilmadi");
  }

  const updates = [];
  const values = [];

  if (req.body.brand !== undefined) {
    values.push(req.body.brand);
    updates.push(`brand = $${values.length}`);
  }

  if (req.body.price !== undefined) {
    values.push(req.body.price);
    updates.push(`price = $${values.length}`);
  }

  if (req.file) {
    const image = toFileUrl(req, req.file.filename);
    values.push(image);
    updates.push(`image = $${values.length}`);
    await deleteLocalFile(car.image);
  }

  if (!updates.length) {
    throw new ApiError(400, "Yangilash uchun ma'lumot yo'q");
  }

  values.push(carId, venueId);

  const result = await pool.query(
    `UPDATE cars SET ${updates.join(", ")}
     WHERE id = $${values.length - 1} AND venue_id = $${values.length}
     RETURNING id, venue_id, brand, price, image, created_at`,
    values
  );

  res.json({ message: "Mashina yangilandi", car: result.rows[0] });
});

const deleteCar = asyncHandler(async (req, res) => {
  const { venueId, carId } = req.params;
  const currentUser = req.user;
  await getVenueAccess(venueId, currentUser);

  const existing = await pool.query("SELECT id, image FROM cars WHERE id = $1 AND venue_id = $2", [carId, venueId]);
  const car = existing.rows[0];
  if (!car) {
    throw new ApiError(404, "Mashina topilmadi");
  }

  await pool.query("DELETE FROM cars WHERE id = $1 AND venue_id = $2", [carId, venueId]);
  await deleteLocalFile(car.image);

  res.json({ message: "Mashina o'chirildi" });
});

module.exports = {
  listVenueImages,
  addVenueImages,
  deleteVenueImage,
  setPrimaryVenueImage,
  listSingers,
  createSinger,
  updateSinger,
  deleteSinger,
  getKarnaySurnay,
  upsertKarnaySurnay,
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listCars,
  createCar,
  updateCar,
  deleteCar,
};
