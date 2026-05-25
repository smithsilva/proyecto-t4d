const express = require("express");

const {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("../controllers/proveedores.controller");

const router = express.Router();

router.get("/", obtenerProveedores);

router.post("/", crearProveedor);

router.put("/:id", actualizarProveedor);

router.delete("/:id", eliminarProveedor);

module.exports = router;