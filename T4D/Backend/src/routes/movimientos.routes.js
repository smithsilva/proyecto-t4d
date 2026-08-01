const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  obtenerMovimientos,
  crearMovimiento,
} = require("../controllers/movimientosController");

router.get("/", verificarRol([1, 3]), obtenerMovimientos); // Admin, Gerente
router.post("/", verificarRol([1]), crearMovimiento); // Admin

module.exports = router;