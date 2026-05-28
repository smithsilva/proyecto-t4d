const express = require("express");

const router = express.Router();

const {
  obtenerMovimientos,
  crearMovimiento,
} = require("../controllers/movimientosController");

// GET
router.get("/", obtenerMovimientos);

// POST
router.post("/", crearMovimiento);

module.exports = router;