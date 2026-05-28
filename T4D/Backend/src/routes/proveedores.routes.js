const express = require("express");

const router = express.Router();

const {
  getProveedores,
  postProveedor,
  putProveedor,
  deleteProveedor,
} = require("../controllers/proveedores.controller");

// =====================================
// GET
// =====================================

router.get(
  "/",
  getProveedores
);

// =====================================
// POST
// =====================================

router.post(
  "/",
  postProveedor
);

// =====================================
// PUT
// =====================================

router.put(
  "/:id",
  putProveedor
);

// =====================================
// DELETE
// =====================================

router.delete(
  "/:id",
  deleteProveedor
);

module.exports = router;