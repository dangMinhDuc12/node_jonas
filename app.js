//IMPORT
const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();

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
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

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
