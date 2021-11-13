const catchAsync = require("./catchAsync");
const AppError = require("./appError");
const APIFeatures = require("../utils/apiFeatures");

module.exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("Cant not found document with this ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

module.exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("Cant not found document with this ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

module.exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });

module.exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //Use for nested routes reviews/tours
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

module.exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError("Cant not found document with this ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
