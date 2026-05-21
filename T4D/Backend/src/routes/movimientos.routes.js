const express = require("express");
const router = express.Router();

const {
  obtenerMovimientos,
} = require("../controllers/movimientosController");

const supabase = require("../config/supabase");

// GET
router.get("/", obtenerMovimientos);

// POST 👇 AQUÍ LO PONES
router.post("/", async (req, res) => {
  try {
    const {
      id_producto,
      id_usuario,
      tipo_movimiento,
      cantidad,
    } = req.body;

    const { data, error } = await supabase
      .from("movimientos_inventario")
      .insert([
        {
          id_producto,
          id_usuario,
          tipo_movimiento,
          cantidad,
          fecha_movimiento: new Date(), // opcional
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;