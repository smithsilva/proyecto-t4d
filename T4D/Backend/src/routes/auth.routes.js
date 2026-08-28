const express = require("express");

const router = express.Router();

const { postLogin } = require("../controllers/auth.controller");

// POST /auth/login
router.post("/login", postLogin);

module.exports = router;