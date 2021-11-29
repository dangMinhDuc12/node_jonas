const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const router = express.Router();

router.get(
  "/my-tour-booking",
  authController.protect,
  viewController.getMyTourBooking
);

router.get("/me", authController.protect, viewController.getMe);

router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get("/login", authController.isLoggedIn, viewController.login);

module.exports = router;
