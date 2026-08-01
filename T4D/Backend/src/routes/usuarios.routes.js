const express = require("express");
const router = express.Router();

const verificarRol = require("../middlewares/verificarRol");

const {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  patchUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");

// Ajusta el id_rol de Admin según tu tabla roles
router.get("/", obtenerUsuarios);
router.post("/", verificarRol([1]), crearUsuario);
router.put("/:id", verificarRol([1]), editarUsuario);
router.patch("/:id", verificarRol([1]), patchUsuario);
router.delete("/:id", verificarRol([1]), eliminarUsuario);

module.exports = router;