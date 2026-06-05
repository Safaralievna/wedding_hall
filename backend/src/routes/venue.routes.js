const express = require("express");
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  approveVenue,
  getAdminVenues,
  getVenueCalendar,
} = require("../controllers/venue.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validators } = require("../utils/validators");
const upload = require("../middlewares/upload");
const {
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
} = require("../controllers/venueExtras.controller");

const router = express.Router();

router.get("/", getVenues);
router.get("/:id", getVenueById);
router.get("/:id/calendar", getVenueCalendar);
router.post("/", authenticate, authorize("admin", "owner"), validate(validators.createVenue), createVenue);
router.patch("/:id", authenticate, authorize("admin", "owner"), updateVenue);
router.delete("/:id", authenticate, authorize("admin", "owner"), deleteVenue);
router.patch("/:id/approve", authenticate, authorize("admin"), approveVenue);

router.get("/:venueId/images", listVenueImages);
router.post(
  "/:venueId/images",
  authenticate,
  authorize("admin", "owner"),
  upload.array("images", 10),
  addVenueImages
);
router.delete("/images/:imageId", authenticate, authorize("admin", "owner"), deleteVenueImage);
router.patch("/:venueId/images/:imageId/primary", authenticate, authorize("admin", "owner"), setPrimaryVenueImage);

router.get("/:venueId/singers", listSingers);
router.post(
  "/:venueId/singers",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  createSinger
);
router.patch(
  "/:venueId/singers/:singerId",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  updateSinger
);
router.delete("/:venueId/singers/:singerId", authenticate, authorize("admin", "owner"), deleteSinger);

router.get("/:venueId/karnay-surnay", getKarnaySurnay);
router.put("/:venueId/karnay-surnay", authenticate, authorize("admin", "owner"), validate(validators.saveKarnaySurnay), upsertKarnaySurnay);

router.get("/:venueId/menu-items", listMenuItems);
router.post(
  "/:venueId/menu-items",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  createMenuItem
);
router.patch(
  "/:venueId/menu-items/:menuItemId",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  updateMenuItem
);
router.delete("/:venueId/menu-items/:menuItemId", authenticate, authorize("admin", "owner"), deleteMenuItem);

router.get("/:venueId/cars", listCars);
router.post(
  "/:venueId/cars",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  createCar
);
router.patch(
  "/:venueId/cars/:carId",
  authenticate,
  authorize("admin", "owner"),
  upload.single("image"),
  updateCar
);
router.delete("/:venueId/cars/:carId", authenticate, authorize("admin", "owner"), deleteCar);

module.exports = router;