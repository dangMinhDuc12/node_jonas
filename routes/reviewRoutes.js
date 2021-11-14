const express = require("express");
const router = express.Router({
  mergeParams: true,
});
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

// [GET] /api/v1/reviews/:id  [NESTED ROUTES] /api/v1/tours/:tourId/reviews/:id
router.get("/:id", authController.protect, reviewController.getReview);

// [PATCH] /api/v1/reviews/:id [NESTED ROUTES] /api/v1/tours/:tourId/reviews/:id
router.patch(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "user"),
  reviewController.updateReview
);

// [DELETE] /api/v1/reviews/:id [NESTED ROUTES] /api/v1/tours/:tourId/reviews/:id
router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin", "user"),
  reviewController.deleteReview
);

// [GET] /api/v1/reviews [NESTED ROUTES] /api/v1/tours/:tourId/reviews
router.get("/", authController.protect, reviewController.getAllReviews);

// [POST] /api/v1/reviews [NESTED ROUTES] /api/v1/tours/:tourId/reviews
router.post(
  "/",
  authController.protect,
  authController.restrictTo("user"),
  reviewController.setTourIdForReview,
  reviewController.createReview
);

module.exports = router;
