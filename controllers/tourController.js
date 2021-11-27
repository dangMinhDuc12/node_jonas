const Tour = require("../models/tourModel");
// const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../utils/handleFactory");
const multer = require("multer");
const sharp = require("sharp");
const deleteFile = require("../utils/deleteFile");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

module.exports.uploadTourImages = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

module.exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //image cover
  const currentTour = await Tour.findById(req.params.id);
  if (currentTour.imageCover) {
    deleteFile("tours", currentTour.imageCover);
  }
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  if (currentTour.images.length) {
    currentTour.images.forEach((img) => {
      deleteFile("tours", img);
    });
  }
  req.body.images = await Promise.all(
    req.files.images.map(async (img, index) => {
      const imgName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imgName}`);

      return imgName;
    })
  );

  next();
});

module.exports.createTour = factory.createOne(Tour);
module.exports.getAllTours = factory.getAll(Tour);
module.exports.updateTour = factory.updateOne(Tour);
module.exports.deleteTour = factory.deleteOne(Tour);
module.exports.getTour = factory.getOne(Tour, { path: "reviews" });

module.exports.getTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

module.exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

module.exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});

// Query Địa lý (tìm các địa điểm cách địa điểm chỉ định 1 khoảng cách nhất định)
module.exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const earthRadiusMiles = 3963.2;
  const earthRadiusKm = 6378.1;
  //Quy đổi ra radius từ mi hoặc km (mi là dặm, 1 dặm khoảng 1.6km)
  const radius =
    unit === "mi" ? distance / earthRadiusMiles : distance / earthRadiusKm;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude with format lat,lng",
        400
      )
    );
  }
  // Query theo toán tử địa lý của mongodb
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// Tìm khoảng cách của tất cả các tours đến 1 điểm chỉ định
module.exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const meterToMi = 0.000621371;
  const merterToKm = 0.001;

  const multiplier = unit === "mi" ? meterToMi : merterToKm;
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude with format lat,lng",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
