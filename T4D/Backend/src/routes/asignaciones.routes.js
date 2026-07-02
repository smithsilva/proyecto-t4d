const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");
const { getAsignaciones } = require("../controllers/asignaciones.controller");

router.get("/", verificarRol([1, 3]), getAsignaciones); // Admin, Gerente

module.exports = router;