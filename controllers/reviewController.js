const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");
const factory = require("../utils/handleFactory");

module.exports.getAllReviews = factory.getAll(Review);
module.exports.createReview = factory.createOne(Review);
module.exports.deleteReview = factory.deleteOne(Review);
module.exports.updateReview = factory.updateOne(Review);
module.exports.getReview = factory.getOne(Review);

module.exports.setTourIdForReview = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};
