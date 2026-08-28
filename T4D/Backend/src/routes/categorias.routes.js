const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getCategorias,
  postCategoria,
  putCategoria,
  patchCategoria,
  deleteCategoria,
} = require("../controllers/categorias.controller");

router.get("/", getCategorias); // Todos los autenticados (para selects/filtros)
router.post("/", verificarRol([1]), postCategoria); // Admin
router.put("/:id", verificarRol([1]), putCategoria); // Admin
router.patch("/:id", verificarRol([1]), patchCategoria); // Admin
router.delete("/:id", verificarRol([1]), deleteCategoria); // Admin

module.exports = router;