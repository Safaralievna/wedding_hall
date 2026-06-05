const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const getAdminStats = asyncHandler(async (req, res) => {
  const [venues, bookings, users, owners, revenue] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM venues`),
    pool.query(`SELECT COUNT(*)::int AS count FROM bookings`),
    pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'user'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'owner'`),
    pool.query(`SELECT COALESCE(SUM(total_price), 0)::numeric(12,2) AS total FROM bookings WHERE status != 'cancelled'`),
  ]);

  const [pendingVenues, approvedVenues, upcomingBookings, cancelledBookings] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM venues WHERE status = 'pending'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM venues WHERE status = 'approved'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'upcoming'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'cancelled'`),
  ]);

  res.json({
    venues: venues.rows[0].count,
    bookings: bookings.rows[0].count,
    users: users.rows[0].count,
    owners: owners.rows[0].count,
    revenue: revenue.rows[0].total,
    pendingVenues: pendingVenues.rows[0].count,
    approvedVenues: approvedVenues.rows[0].count,
    upcomingBookings: upcomingBookings.rows[0].count,
    cancelledBookings: cancelledBookings.rows[0].count,
  });
});

const getOwnerStats = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const [venues, bookings, upcomingBookings, approvedVenues, pendingVenues] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM venues WHERE owner_id = $1`, [ownerId]),
    pool.query(`
      SELECT COUNT(*)::int AS count
      FROM bookings b
      JOIN venues v ON v.id = b.venue_id
      WHERE v.owner_id = $1
    `, [ownerId]),
    pool.query(`
      SELECT COUNT(*)::int AS count
      FROM bookings b
      JOIN venues v ON v.id = b.venue_id
      WHERE v.owner_id = $1 AND b.status = 'upcoming'
    `, [ownerId]),
    pool.query(`SELECT COUNT(*)::int AS count FROM venues WHERE owner_id = $1 AND status = 'approved'`, [ownerId]),
    pool.query(`SELECT COUNT(*)::int AS count FROM venues WHERE owner_id = $1 AND status = 'pending'`, [ownerId]),
  ]);

  res.json({
    venues: venues.rows[0].count,
    bookings: bookings.rows[0].count,
    upcomingBookings: upcomingBookings.rows[0].count,
    approvedVenues: approvedVenues.rows[0].count,
    pendingVenues: pendingVenues.rows[0].count,
  });
});

module.exports = {
  getAdminStats,
  getOwnerStats,
};