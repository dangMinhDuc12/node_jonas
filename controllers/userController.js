const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../utils/handleFactory");
const filterAllowData = (obj, ...allowFields) => {
  return Object.keys(obj).reduce((acc, el) => {
    if (allowFields.includes(el)) acc[el] = obj[el];
    return acc;
  }, {});
};

module.exports.getAllUsers = factory.getAll(User);
// Admin update user(not password)
module.exports.updateUser = factory.updateOne(User);
module.exports.deleteUser = factory.deleteOne(User);
module.exports.getUser = factory.getOne(User);

//User update profile
module.exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
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

module.exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
