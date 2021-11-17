const express = require("express");
const viewController = require("../controllers/viewController");
const router = express.Router();

router.get("/tour", viewController.getTour);

router.get("/", viewController.getOverview);

module.exports = router;
