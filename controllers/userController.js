const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../utils/handleFactory");
const multer = require("multer");
const sharp = require("sharp");
const deleteFile = require("../utils/deleteFile");

// const multerStorage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "public/img/users");
//   },
//   filename(req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

//Tạo storage dạng memory để ảnh đc truyền dưới dạng buffer giúp ta có thể resize
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const filterAllowData = (obj, ...allowFields) => {
  return Object.keys(obj).reduce((acc, el) => {
    if (allowFields.includes(el)) acc[el] = obj[el];
    return acc;
  }, {});
};

module.exports.uploadUserPhoto = upload.single("photo");

module.exports.resizeImg = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

module.exports.getAllUsers = factory.getAll(User);
// Admin update user(not password)
module.exports.updateUser = factory.updateOne(User);
module.exports.deleteUser = factory.deleteOne(User);
module.exports.getUser = factory.getOne(User);

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
  const currentUser = await User.findById(req.user._id);
  if (req.file) {
    dataUpdate.photo = req.file.filename;
    deleteFile("users", currentUser.photo);
  }

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
