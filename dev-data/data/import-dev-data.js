const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({
  path: "../../config.env",
});

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => console.log("Connected to DB"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Imported DB");
    process.exit(); //exit khỏi terminal
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Deleted DB");
    process.exit(); //exit khỏi terminal
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
