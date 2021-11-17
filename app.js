//IMPORT
const express = require("express");
const path = require("path");
const multer = require("multer");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many request from this IP",
});
//MIDDLEWARE
dotenv.config({
  path: "./config.env",
});

//CONFIG + MIDDLEWARE
app.use(express.json()); //parsing application/json
app.use(express.urlencoded({ extended: true })); //parsing application/xwww-form-urlencoded
app.use(multer().array()); //parsing multipart/form-data

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/api", limiter);

//ROUTES

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/", viewRouter);

//ERROR HANDLE

//No route match
app.all("*", (req, res, next) => {
  const err = new AppError(`Can't not found ${req.originalUrl} on server`, 404);
  next(err);
});

app.use(globalErrorHandler);

//SERVER
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
(async () => {
  try {
    await mongoose.connect(DB);
    console.log("Connected to DB");
    app.listen(port, () => {
      console.log(`App run on ${port}`);
    });
  } catch (err) {
    console.log(err.name, err.message);
  }
})();
