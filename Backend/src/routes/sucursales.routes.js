const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  obtenerSucursales,
  obtenerSucursalPorId,
  crearSucursal,
  actualizarSucursal,
  actualizarParcialSucursal,
  eliminarSucursal,
} = require("../controllers/sucursales.controller");

router.get("/", obtenerSucursales); // Todos los autenticados
router.get("/:id", obtenerSucursalPorId); // Todos los autenticados
router.post("/", verificarRol([1, 2]), crearSucursal); // Admin, Contador
router.put("/:id", verificarRol([1, 2]), actualizarSucursal); // Admin, Contador
router.patch("/:id", verificarRol([1, 2]), actualizarParcialSucursal); // Admin, Contador
router.delete("/:id", verificarRol([1, 2]), eliminarSucursal); // Admin, Contador

module.exports = router;