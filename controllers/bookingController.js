const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const stripe = require("stripe")(
  "sk_test_51JZxAbJzdm9oGD68p8ds7DAxlKZSOuDezv9xbbXjmp6rq3soT2UtnrZifmV5BiAX5JE35iKbDtw5JBQjuJH8DklF002vimLhTN"
);

//DOC: https://stripe.com/docs/api/checkout/sessions/create, https://stripe.com/docs/checkout/quickstart
module.exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //Get current tour
  const tour = await Tour.findById(req.params.tourId);
  //create checkout session //Use secret key
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  //send session to client
  res.status(200).json({
    status: "success",
    session,
  });
});

module.exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({
    tour,
    price,
    user,
  });

  res.redirect(req.originalUrl.split("?")[0]);
});

module.exports;
