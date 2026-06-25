const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  actualizarParcialUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);
router.put("/:id", editarUsuario);
router.patch("/:id", actualizarParcialUsuario);
router.delete("/:id", eliminarUsuario);
module.exports = router;