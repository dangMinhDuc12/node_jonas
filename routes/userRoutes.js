const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// [POST] /api/v1/users/signup
router.post("/signup", authController.signUp);

// [POST] /api/v1/users/login
router.post("/login", authController.login);

// [GET] /api/v1/users
router.get("/", userController.getAllUsers);

module.exports = router;
