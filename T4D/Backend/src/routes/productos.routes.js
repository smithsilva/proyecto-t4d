const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getProductos,
  postProducto,
  putProducto,
  deleteProducto,
  patchProducto,
  patchStock, // 👈 nuevo controller que crearemos
} = require("../controllers/productos.controller");

router.get("/", getProductos); // Todos los autenticados
router.post("/", verificarRol([1]), postProducto); // Admin
router.put("/:id", verificarRol([1]), putProducto); // Admin
router.patch("/:id", verificarRol([1]), patchProducto); // Admin (edición completa)
router.patch("/:id/stock", verificarRol([1, 4]), patchStock); // Admin, Mecánico (solo stock)
router.delete("/:id", verificarRol([1]), deleteProducto); // Admin

module.exports = router;