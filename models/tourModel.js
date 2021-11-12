const { Schema, model } = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");
const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"], // String là message lỗi hiện ra khi không có trường này
      unique: true,
      minlength: [10, "A tour must have at least 10 characters"],
      maxlength: [40, "A tour must have max 40 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "difficult", "medium"],
        message: "Difficulty is either: easy, difficult, medium",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating at least is 1"],
      max: [5, "Rating max is 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount ({VALUE}) greater than price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON in mongoose dùng để xác định toạ độ
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, //Khai báo để có thể sử dụng virtual
  }
);

//Virtual tạo 1 field trong dữ liệu trả về mà không cần phải khai báo trong Schema define. Field này có tác dụng kết hợp các field trong data lại với nhau.
tourSchema.virtual("durationWeek").get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Document middleware, pre với hook save được gọi trước khi thực hiện doc.save() hoặc Model.create()
// tourSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, {
//     lower: true,
//   });
//   next();
// });

// tourSchema.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

//Query middleware: Chạy trước và sau khi query
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(this);
//   console.log(`Time to query: ${Date.now() - this.start}`);
//   next();
// });

// //Aggregate middleware
// tourSchema.pre("aggregate", function (next) {
//   console.log(this.pipeline());
//   next();
// });

module.exports = model("Tour", tourSchema);
