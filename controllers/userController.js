const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterAllowData = (obj, ...allowFields) => {
  return Object.keys(obj).reduce((acc, el) => {
    if (allowFields.includes(el)) acc[el] = obj[el];
    return acc;
  }, {});
};

module.exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

//User update profile
module.exports.updateMe = catchAsync(async (req, res, next) => {
  //Prevent user change password in this route
  const { password, passwordConfirm } = req.body;
  if (password || passwordConfirm) {
    return next(
      new AppError(
        "This router cannot update password. Please try path /updatePassword",
        400
      )
    );
  }

  //Filter data change
  const dataUpdate = filterAllowData(req.body, "email", "name");
  const updatedUser = await User.findByIdAndUpdate(req.user._id, dataUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

//Soft delete user
module.exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
