const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  patchUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);
router.put("/:id", editarUsuario);
router.patch("/:id", patchUsuario);
router.delete("/:id", eliminarUsuario);

module.exports = router;