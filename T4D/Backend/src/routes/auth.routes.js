const express = require("express");
const router = express.Router();

const {
  postLogin,
  postForgotPassword,
  postResetPassword,
} = require("../controllers/auth.controller");

// POST /auth/login
router.post("/login", postLogin);

// POST /auth/forgot-password
router.post("/forgot-password", postForgotPassword);

// POST /auth/reset-password
router.post("/reset-password", postResetPassword);

module.exports = router;