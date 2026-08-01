const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getProveedores,
  postProveedor,
  putProveedor,
  patchProveedor,
  deleteProveedor,
} = require("../controllers/proveedores.controller");

router.get("/", getProveedores); // Todos los autenticados
router.post("/", verificarRol([1, 2]), postProveedor); // Admin, Contador
router.put("/:id", verificarRol([1, 2]), putProveedor); // Admin, Contador
router.patch("/:id", verificarRol([1, 2]), patchProveedor); // Admin, Contador
router.delete("/:id", verificarRol([1, 2]), deleteProveedor); // Admin, Contador

module.exports = router;