const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

// [GET] /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit
router.get(
  "/tours-within/:distance/center/:latlng/unit/:unit",
  tourController.getToursWithin
);

// [GET] /api/v1/tours/distances/:latlng/unit/:unit
router.get("/distances/:latlng/unit/:unit", tourController.getDistances);

// [NESTED ROUTES] /api/v1/tours/:tourId/reviews
router.use("/:tourId/reviews", reviewRouter);
// [POST] /api/v1/tours
router.post(
  "/",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  tourController.createTour
);

// [GET] /api/v1/tours/monthly-plan/2021
router.get(
  "/monthly-plan/:year",
  authController.protect,
  authController.restrictTo("admin", "lead-guide", "guide"),
  tourController.getMonthlyPlan
);

// [GET] /api/v1/tours/tour-stats
router.get("/tour-stats", tourController.getTourStats);

// [GET] /api/v1/tours
router.get("/", tourController.getAllTours);

// [GET] /api/v1/tours/top-5-cheap
router.get(
  "/top-5-cheap",
  tourController.getTopTours,
  tourController.getAllTours
);

// [GET] /api/v1/tours/:id
router.get("/:id", tourController.getTour);

// [PATCH] /api/v1/tours/:id
router.patch(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.updateTour
);

//[DELETE] /api/v1/tours/:id
router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "lead-guide"),
  tourController.deleteTour
);

module.exports = router;
