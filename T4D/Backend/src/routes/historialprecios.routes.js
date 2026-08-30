const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getProductos,
  postProducto,
  putProducto,
  patchEstadoProducto,
  deleteProducto,
  getHistorial,
  deleteHistorial,
} = require("../controllers/historialprecios.controller");

// Roles: 1 = admin, 2 = gerente, 3 = contadora  (ajustar si tu tabla "roles" usa otros IDs)

// ── PRODUCTOS ──
router.get("/productos", getProductos);                                  // Todos los autenticados
router.post("/productos", verificarRol([1, 2]), postProducto);           // Admin y gerente
router.put("/productos/:id", verificarRol([1, 2]), putProducto);         // Admin y gerente
router.patch("/productos/:id/estado", verificarRol([1]), patchEstadoProducto); // Solo admin
router.delete("/productos/:id", verificarRol([1]), deleteProducto);      // Solo admin

// ── HISTORIAL ──
router.get("/", getHistorial);                                           // Todos los autenticados (soporta ?id_producto=)
router.delete("/:id", verificarRol([1]), deleteHistorial);               // Solo admin

module.exports = router;