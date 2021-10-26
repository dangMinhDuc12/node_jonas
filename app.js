//IMPORT
const express = require("express");
const multer = require("multer");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
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

//SERVER
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
(async () => {
  await mongoose.connect(DB);
  console.log("Connected to DB");
  app.listen(port, () => {
    console.log(`App run on ${port}`);
  });
})();
