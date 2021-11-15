const { Schema, model } = require("mongoose");
const Tour = require("../models/tourModel");
const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong a tour"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false, //Khai báo để có thể sử dụng virtual
  }
);

//Ngăn không cho user bình luận 2 review trên 1 tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Tạo static method để tính toán rating trung bình và tổng số rating review

reviewSchema.statics.calcRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: "$tour",
        allRatings: {
          $sum: 1,
        },
        ratingAvg: {
          $avg: "$rating",
        },
      },
    },
  ]);
  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].allRatings,
      ratingsAverage: stats[0].ratingAvg,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function (doc, next) {
  this.constructor.calcRatings(this.tour);
  next();
});

// Xử lý khi update delete review
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewDoc = await this.findOne().clone(); // this ở đây trỏ tới query hiện tại nên phải execute nó để lấy đc document hiện tại
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  //ko thể gọi findOne vì query đã đc thực hiện xong khi vào middleware này
  this.reviewDoc.constructor.calcRatings(this.reviewDoc.tour);
});

module.exports = model("Review", reviewSchema);
