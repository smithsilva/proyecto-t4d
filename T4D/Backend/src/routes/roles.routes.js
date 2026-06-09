const express = require("express");

const router = express.Router();

// ======================================
// GET ROLES
// ======================================

router.get("/", async (req, res) => {

  res.json([
    {
      id_rol: 1,
      nombre_rol: "Admin",
    },

    {
      id_rol: 2,
      nombre_rol: "Gerente",
    },

    {
      id_rol: 3,
      nombre_rol: "Contadora",
    },

    {
      id_rol: 4,
      nombre_rol: "Mecanico",
    },
  ]);

});

module.exports = router;