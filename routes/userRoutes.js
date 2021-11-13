const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// [POST] /api/v1/users/forgotpassword
router.post("/forgotpassword", authController.forgotPassword);

// [PATCH] /api/v1/users/updatePassword
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

// [PATCH] /api/v1/users/updateMe
router.patch("/updateMe", authController.protect, userController.updateMe);

// [DELETE] /api/v1/users/deleteMe
router.delete("/deleteMe", authController.protect, userController.deleteMe);

// [PATCH] /api/v1/users/resetPassword/:token
router.patch("/resetPassword/:token", authController.resetPassword);

// [POST] /api/v1/users/signup
router.post("/signup", authController.signUp);

// [POST] /api/v1/users/login
router.post("/login", authController.login);

// [GET] /api/v1/users/:id
router.get("/:id", userController.getUser);

// [PATCH] /api/v1/users/login
router.patch(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUser
);

// [DELETE] /api/v1/users/:id
router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);

// [GET] /api/v1/users
router.get("/", userController.getAllUsers);

module.exports = router;
