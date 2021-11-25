const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add your password"],
    minlength: 8,
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Encrypt pw before save
userSchema.pre("save", async function (next) {
  //hàm isModified kiểm tra nếu field truyền vào được thay đổi sẽ return true ngược lại là false, áp dụng với save và create
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//Add field passwordChangedAt when change pw
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Quert middleware
userSchema.pre(/^find/, function (next) {
  //This tham chiếu đến Query object
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.checkPasswordChange = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangeAtTS = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < passwordChangeAtTS;
  }

  //PW no changed
  return false;
};

//Create reset token
userSchema.methods.createResetPWToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = model("User", userSchema);
