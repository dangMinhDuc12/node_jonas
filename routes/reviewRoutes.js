const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

// [GET] /api/v1/reviews
router.get("/", reviewController.getAllReviews);

// [POST] /api/v1/reviews
router.post(
  "/",
  authController.protect,
  authController.restrictTo("user"),
  reviewController.createReview
);

module.exports = router;
