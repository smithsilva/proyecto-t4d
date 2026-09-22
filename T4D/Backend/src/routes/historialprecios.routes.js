const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getProductos,
  putProducto,
  patchEstadoProducto,
  getHistorial,
} = require("../controllers/historialprecios.controller");

// Roles: 1 = admin, 2 = gerente, 3 = contadora (ajustar si tu tabla "roles" usa otros IDs)
//
// La creación y eliminación de productos vive exclusivamente en el módulo
// de Inventario (/productos). Este módulo solo puede VER y ACTUALIZAR
// (precio) los productos que ya existen, y VER su historial. No hay
// eliminación de productos ni de registros de historial aquí.

// ── PRODUCTOS (solo lectura + actualización de precio) ──
router.get("/productos", getProductos);                                        // Todos los autenticados
router.put("/productos/:id", verificarRol([1, 2]), putProducto);               // Admin y gerente: actualizar precio
router.patch("/productos/:id/estado", verificarRol([1]), patchEstadoProducto); // Solo admin: activar/desactivar

// ── HISTORIAL (solo lectura) ──
router.get("/", getHistorial); // Todos los autenticados (soporta ?id_producto=)

module.exports = router;