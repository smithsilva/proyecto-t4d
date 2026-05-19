const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const conexion = require("../db");

const router = express.Router();

// =====================================
// LOGIN
// =====================================

router.post("/login", (req, res) => {

  const { correo, password, codigo } = req.body;

  // =====================================
  // BUSCAR USUARIO
  // =====================================

  conexion.query(
    "SELECT * FROM Usuarios WHERE email = ?",
    [correo],
    async (err, results) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          mensaje: "Error servidor"
        });

      }

      // =====================================
      // USUARIO NO EXISTE
      // =====================================

      if (results.length === 0) {

        return res.status(404).json({
          mensaje: "Usuario no encontrado"
        });

      }

      const usuario = results[0];

      // =====================================
      // VALIDAR PASSWORD
      // =====================================

      const passwordCorrecta =
        await bcrypt.compare(
          password,
          usuario.password_hash
        );

      if (!passwordCorrecta) {

        return res.status(401).json({
          mensaje: "Contraseña incorrecta"
        });

      }

      // =====================================
      // VALIDAR CODIGO
      // =====================================

      if (usuario.codigo !== codigo) {

        return res.status(401).json({
          mensaje: "Código incorrecto"
        });

      }

      // =====================================
      // VALIDAR ACTIVO
      // =====================================

      if (!usuario.activo) {

        return res.status(403).json({
          mensaje: "Usuario deshabilitado"
        });

      }

      // =====================================
      // ACTUALIZAR ULTIMO ACCESO
      // =====================================

      conexion.query(
        "UPDATE Usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?",
        [usuario.id_usuario]
      );

      // =====================================
      // TOKEN
      // =====================================

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          rol: usuario.id_rol
        },
        "secreto",
        {
          expiresIn: "8h"
        }
      );

      // =====================================
      // RESPUESTA
      // =====================================

      res.json({
        mensaje: "Login exitoso",
        token,
        usuario
      });

    }
  );

});

module.exports = router;