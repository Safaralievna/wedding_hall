const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getInvitationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug || typeof slug !== "string") {
    throw new ApiError(400, "Invitation slug noto'g'ri");
  }

  const result = await pool.query(
    `SELECT
       b.id,
       b.venue_id,
       b.bride_name,
       b.groom_name,
       b.hall_name,
       b.hall_address,
       b.event_date,
       b.wedding_time,
       b.invitation_slug,
       b.payment_status,
       b.status,
       b.total_price,
       b.advance_paid,
       b.guest_count,
       v.district_id,
       d.name AS district_name
     FROM bookings b
     JOIN venues v ON v.id = b.venue_id
     JOIN districts d ON d.id = v.district_id
     WHERE b.invitation_slug = $1
       AND b.payment_status = 'paid'
       AND b.status != 'cancelled'
     LIMIT 1`,
    [slug]
  );

  const invitation = result.rows[0];
  if (!invitation) {
    throw new ApiError(404, "Taklifnoma topilmadi yoki to'lov amalga oshirilmagan");
  }

  res.json(invitation);
});

module.exports = {
  getInvitationBySlug,
};
