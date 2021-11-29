const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

module.exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    select: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with this name", 404));
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

module.exports.login = (req, res, next) => {
  res.status(200).render("login", {
    title: "Login pages",
  });
};

module.exports.getMe = (req, res, next) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

module.exports.getMyTourBooking = catchAsync(async (req, res, next) => {
  const userBooking = await Booking.find({ user: req.user._id });
  const tourIds = userBooking.map((b) => b.tour._id);

  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render("overview", {
    title: "My Booking Tour",
    tours,
  });
});
