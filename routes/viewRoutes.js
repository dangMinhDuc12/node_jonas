const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/tour/:slug", authController.protect, viewController.getTour);

router.get("/", viewController.getOverview);

router.get("/login", viewController.login);

module.exports = router;
