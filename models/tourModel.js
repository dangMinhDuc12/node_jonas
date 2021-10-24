const { Schema, model } = require("mongoose");

const tourSchema = new Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"], // String là message lỗi hiện ra khi không có trường này
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
});

module.exports = model("Tour", tourSchema);
