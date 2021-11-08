const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// [POST] /api/v1/users/forgotpassword
router.post("/forgotpassword", authController.forgotPassword);

// [PATCH] /api/v1/users/resetPassword/:token
router.patch("/resetPassword/:token", authController.resetPassword);

// [POST] /api/v1/users/signup
router.post("/signup", authController.signUp);

// [POST] /api/v1/users/login
router.post("/login", authController.login);

// [GET] /api/v1/users
router.get("/", userController.getAllUsers);

module.exports = router;
