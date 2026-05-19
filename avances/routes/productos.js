const express = require("express");
const router = express.Router();

const conexion = require("../db");

// ============================
// OBTENER
// ============================
router.get("/", (req, res) => {

  conexion.query("SELECT * FROM productos", (error, resultados) => {

    if (error) {
      return res.status(500).json(error);
    }

    res.json(resultados);

  });

});

// ============================
// AGREGAR (POST CORREGIDO)
// ============================
router.post("/", (req, res) => {

  console.log("BODY RECIBIDO:", req.body); // 👈 agregar esto

  const {
    codigo_barras,
    nombre_producto,
    descripcion,
    stock_actual,
    imagen,
  } = req.body;

  const sql = `
    INSERT INTO productos
    (
      codigo_barras,
      nombre_producto,
      descripcion,
      precio_actual,
      stock_actual,
      activo,
      imagen
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  conexion.query(
    sql,
    [
      codigo_barras,
      nombre_producto,
      descripcion,
      1000,
      stock_actual,
      true,
      imagen,
    ],
    (error) => {

      if (error) {
        console.log("ERROR MYSQL:", error);
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Producto agregado",
      });

    }
  );

});

// ============================
// EDITAR
// ============================
router.put("/:id", (req, res) => {

  if (!req.body) {
    return res.status(400).json({
      error: "No llegó el body"
    });
  }

  const {
    codigo_barras,
    nombre_producto,
    descripcion,
    stock_actual,
    imagen,
  } = req.body;

  const sql = `
    UPDATE productos
    SET
      codigo_barras = ?,
      nombre_producto = ?,
      descripcion = ?,
      stock_actual = ?,
      imagen = ?
    WHERE id_producto = ?
  `;

  conexion.query(
    sql,
    [
      codigo_barras,
      nombre_producto,
      descripcion,
      stock_actual,
      imagen,
      req.params.id,
    ],
    (error) => {

      if (error) {
        console.log("ERROR MYSQL:", error);
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Producto actualizado",
      });

    }
  );

});

// ============================
// ELIMINAR
// ============================
router.delete("/:id", (req, res) => {

  conexion.query(
    "DELETE FROM productos WHERE id_producto = ?",
    [req.params.id],
    (error) => {

      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        mensaje: "Producto eliminado",
      });

    }
  );

});

// ============================
// PATCH
// ============================
router.patch("/:id", (req, res) => {

  const campos = req.body;

  if (!campos || Object.keys(campos).length === 0) {
    return res.status(400).json({
      mensaje: "No se enviaron campos para actualizar",
    });
  }

  const keys = Object.keys(campos);
  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const valores = [...Object.values(campos), req.params.id];

  const sql = `
    UPDATE productos
    SET ${sets}
    WHERE id_producto = ?
  `;

  conexion.query(sql, valores, (error) => {

    if (error) {
      console.log("ERROR MYSQL:", error);
      return res.status(500).json(error);
    }

    res.json({
      mensaje: "Producto actualizado parcialmente",
    });

  });

});

module.exports = router;