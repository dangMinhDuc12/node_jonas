const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add your name"],
  },
  email: {
    type: String,
    required: [true, "Please add your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please add a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please add your password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please add your password confirm"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password confirm not match with password",
    },
  },
});

userSchema.pre("save", async function (next) {
  //hàm isModified kiểm tra nếu field truyền vào được thay đổi sẽ return true ngược lại là false
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

module.exports = model("User", userSchema);
