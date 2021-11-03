const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

module.exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
