const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

// [POST] /api/v1/tours
router.post("/", tourController.createTour);

// [GET] /api/v1/tours
router.get("/", tourController.getAllTours);

// [GET] /api/v1/tours/:id
router.get("/:id", tourController.getTour);

// [PATCH] /api/v1/tours/:id
router.patch("/:id", tourController.updateTour);

//[DELETE] /api/v1/tours/:id
router.delete("/:id", tourController.deleteTour);

module.exports = router;
