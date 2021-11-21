const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendMail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const createResToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_EXPIRES_COOKIE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
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

  await newUser.save();
  createResToken(newUser, 201, res);
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

  createResToken(user, 200, res);
});

module.exports.protect = catchAsync(async (req, res, next) => {
  //Check token in header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

//Reset PW Flow
module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Check user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("This user does not exist", 404));
  }

  //Create Reset PW token
  const resetToken = user.createResetPWToken();
  await user.save({ validateBeforeSave: false });

  //Send email to user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password, click the link ${resetURL} and type your new password. If you didn't forget your password, please ignore this email`;
  try {
    await sendMail({
      to: user.email,
      subject: "Your password reset token (valid for 10min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Error send mail. Try again later", 500));
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  // Encrypt token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //Check user with token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid token or token expired", 400));
  }

  //Update pw
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  //Sign new token for user
  createResToken(user, 200, res);
});

//Update password
module.exports.updatePassword = catchAsync(async (req, res, next) => {
  //Check current password of user
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError("Password current incorrect. Please try again", 401)
    );
  }

  //Change PW
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //Crete new token for user
  createResToken(user, 200, res);
});
