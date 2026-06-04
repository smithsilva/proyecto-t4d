const express = require("express");
const router = express.Router();
const { getAsignaciones } = require("../controllers/asignaciones.controller");

router.get("/", getAsignaciones);

module.exports = router;