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
      $match: { ratingsAverage: { $gte: 4.5 } }, //$match: Query nh???ng document match v???i ??i???u ki???n n??y
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, // ?????t id th?? s??? query ra nhi???u document m???i document ???ng v???i 1 id l?? 1 value c???a 1 field trong document,
        numTours: { $sum: 1 }, // Th??m field numTours l?? 1 v??o trong object t???ng tr??? ra ????? t??nh to??n s??? document match
        numRatings: { $sum: "$ratingsQuantity" }, //T??nh t???ng c??c ratingsQuantity,
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
  ]); //aggregate: gi???ng v???i reduce array js, t???p h???p c??c document th??nh 1 object js ????? t??nh to??n t???ng h???p l???i m???i th???
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
      $unwind: "$startDates", // unwind: gi???i c??c field l?? array th??nh c??c document ri??ng l???. C??c document n??y s??? c?? field ???????c ch??? ?????nh trong unwind l?? 1 ph???n t??? thu???c m???ng ban ?????u
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
        //project gi???ng v???i select, ch???n hay b??? c??c tr?????ng b???ng 0 ho???c 1
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

// Query ?????a l?? (t??m c??c ?????a ??i???m c??ch ?????a ??i???m ch??? ?????nh 1 kho???ng c??ch nh???t ?????nh)
module.exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const earthRadiusMiles = 3963.2;
  const earthRadiusKm = 6378.1;
  //Quy ?????i ra radius t??? mi ho???c km (mi l?? d???m, 1 d???m kho???ng 1.6km)
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
  // Query theo to??n t??? ?????a l?? c???a mongodb
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

// T??m kho???ng c??ch c???a t???t c??? c??c tours ?????n 1 ??i???m ch??? ?????nh
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
