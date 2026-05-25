const express = require("express");

const router = express.Router();

// ======================================
// GET PROVEEDORES
// ======================================

router.get("/", async (req, res) => {

  res.json([
    {
      id_proveedor: 1,
      nombre: "Proveedor Demo",
      telefono: "3001234567",
    },
  ]);

});

// ======================================
// POST PROVEEDORES
// ======================================

router.post("/", async (req, res) => {

  const proveedor = req.body;

  res.status(201).json({
    success: true,
    message: "Proveedor creado correctamente",
    data: proveedor,
  });

});

module.exports = router;