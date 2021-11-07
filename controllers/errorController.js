const AppError = require("../utils/appError");

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("error", err);
    res.status(500).json({
      status: "error",
      message: "Some thing went wrong",
    });
  }
};

const handleCastErrDB = (err) => {
  const message = `Invalid field ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDupName = (err) => {
  const nameDup = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate value ${nameDup}. Please choose another value`;
  return new AppError(message, 400);
};

const handleValid = (err) => {
  const message = Object.values(err.errors)
    .map((e) => e.message)
    .join(". ");
  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = "User doesn't exist. Please try login again";
  return new AppError(message, 401);
};

const handleTokenExpiredErr = () => {
  const message = "Token expired. Please login again";
  return new AppError(message, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") {
      error = handleCastErrDB(err);
    } else if (err.code === 11000) {
      error = handleDupName(err);
    } else if (err.name === "ValidationError") {
      error = handleValid(err);
    } else if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
      error = handleTokenExpiredErr();
    }
    sendErrProd(error, res);
  }
};
