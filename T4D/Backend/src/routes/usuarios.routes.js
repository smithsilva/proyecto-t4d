const express = require("express");

const router = express.Router();

// ======================================
// DATOS TEMPORALES
// ======================================

const usuarios = [
  {
    id_usuario: 1,
    username: "admin",
    email: "admin@gmail.com",
  },

  {
    id_usuario: 2,
    username: "gerente",
    email: "gerente@gmail.com",
  },

  {
    id_usuario: 3,
    username: "contadora",
    email: "contadora@gmail.com",
  },

  {
    id_usuario: 4,
    username: "mecanico",
    email: "mecanico@gmail.com",
  },
];

// ======================================
// GET USUARIOS
// ======================================

router.get("/", async (req, res) => {
  res.json(usuarios);
});

// ======================================
// GET USUARIO POR ID
// ======================================

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const usuario = usuarios.find(
    (u) => u.id_usuario === id
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado",
    });
  }

  res.json(usuario);
});

// ======================================
// POST USUARIO
// ======================================

router.post("/", async (req, res) => {

  const nuevoUsuario = {
    id_usuario: usuarios.length + 1,
    ...req.body,
  };

  res.status(201).json({
    mensaje: "Usuario creado correctamente",
    usuario: nuevoUsuario,
  });
});

// ======================================
// PUT USUARIO
// ======================================

router.put("/:id", async (req, res) => {

  const id = parseInt(req.params.id);

  const usuario = usuarios.find(
    (u) => u.id_usuario === id
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado",
    });
  }

  const usuarioActualizado = {
    ...usuario,
    ...req.body,
  };

  res.json({
    mensaje: "Usuario actualizado correctamente",
    usuario: usuarioActualizado,
  });
});

// ======================================
// DELETE USUARIO
// ======================================

router.delete("/:id", async (req, res) => {

  const id = parseInt(req.params.id);

  const usuario = usuarios.find(
    (u) => u.id_usuario === id
  );

  if (!usuario) {
    return res.status(404).json({
      mensaje: "Usuario no encontrado",
    });
  }

  res.json({
    mensaje: "Usuario eliminado correctamente (simulado)",
    usuario,
  });
});

module.exports = router;