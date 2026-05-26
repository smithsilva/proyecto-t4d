const express = require("express");

const router = express.Router();

const {
  obtenerMovimientos,
  crearMovimiento,
} = require("../controllers/movimientosController");

// GETa
router.get("/", obtenerMovimientos);

// POST
router.post("/", crearMovimiento);

module.exports = router;