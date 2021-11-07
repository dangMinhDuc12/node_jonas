const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;
  const newUser = new User({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });

  const token = await signToken(newUser._id);
  await newUser.save();
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

module.exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email or password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = await signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

module.exports.protect = catchAsync(async (req, res, next) => {
  //Check token in header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access", 401)
    );
  }

  //Verify token
  //promisify biến 1 function thành 1 promise
  const jwtPromise = promisify(jwt.verify);
  const decoded = await jwtPromise(token, process.env.JWT_SECRET);

  //Check User Exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("User doesn't exist. Please try login again", 401)
    );
  }

  //Check password change
  if (currentUser.checkPasswordChange(decoded.iat)) {
    return next(new AppError("Password changed, Please try login again", 401));
  }
  //validate success
  req.user = currentUser;
  next();
});

//Check permission
module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Your do not have permission to perform this", 403)
      );
    }
    next();
  };
};
