const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

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
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
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
      message: err.message,
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

module.exports.getTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

module.exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }, //$match: Query những document match với điều kiện này
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" }, // Đặt id thì sẽ query ra nhiều document mỗi document ứng với 1 id là 1 value của 1 field trong document,
          numTours: { $sum: 1 }, // Thêm field numTours là 1 vào trong object tổng trả ra để tính toán số document match
          numRatings: { $sum: "$ratingsQuantity" }, //Tính tổng các ratingsQuantity,
          avgRatings: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
    ]); //aggregate: giống với reduce array js, tập hợp các document thành 1 object js để tính toán tổng hợp lại mọi thứ
    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

module.exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates", // unwind: giải các field là array thành các document riêng lẻ. Các document này sẽ có field được chỉ định trong unwind là 1 phần tử thuộc mảng ban đầu
      },
      {
        $match: {
          startDates: { $gte: new Date(`${year}-01-01`) },
          startDates: { $lte: new Date(`${year}-12-31`) },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numToursStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: {
          month: "$_id",
        },
      },
      {
        $project: {
          //project giống với select, chọn hay bỏ các trường bằng 0 hoặc 1
          _id: 0,
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
