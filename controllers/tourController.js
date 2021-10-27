const Tour = require("../models/tourModel");

module.exports.createTour = async (req, res, next) => {
  try {
    const newTour = new Tour(req.body);
    await newTour.save();
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.getAllTours = async (req, res, next) => {
  try {
    //Basic filter
    const queryObj = { ...req.query };
    const excludeQuery = ["page", "sort", "limit", "fields"];
    excludeQuery.forEach((e) => delete queryObj[e]);

    //Advance filter
    let queryStr = JSON.stringify(queryObj);
    //replace lt => $lt
    queryStr = JSON.parse(
      queryStr.replace(/\b(lt|gt|gte|lte)\b/g, (match) => `$${match}`)
    );

    //Sort
    let query = Tour.find(queryStr);
    if (req.query.sort) {
      const sortQuery = req.query.sort.split(",").join(" ");
      query = query.sort(sortQuery);
    } else {
      query = query.sort("-createdAt");
    }

    // Fields limit
    if (req.query.fields) {
      const selectQuery = req.query.fields.split(",").join(" ");
      query = query.select(selectQuery);
    } else {
      query = query.select("-__v");
    }

    const tours = await query;
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.getTour = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
