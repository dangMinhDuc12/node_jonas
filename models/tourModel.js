const { Schema, model } = require("mongoose");
const slugify = require("slugify");
const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"], // String là message lỗi hiện ra khi không có trường này
      unique: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: Number,
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

// Document middleware, pre với hook save được gọi trước khi thực hiện doc.save() hoặc Model.create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

module.exports = model("Tour", tourSchema);
