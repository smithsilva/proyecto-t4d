const express = require("express");

const router =
  express.Router();

const {
  getProveedores,
  postProveedor,
  putProveedor,
  patchProveedor,
  deleteProveedor,
} = require(
  "../controllers/proveedores.controller"
);

// GET
router.get(
  "/",
  getProveedores
);

// POST
router.post(
  "/",
  postProveedor
);

// PUT
router.put(
  "/:id",
  putProveedor
);

// PATCH
router.patch(
  "/:id",
  patchProveedor
);

// DELETE
router.delete(
  "/:id",
  deleteProveedor
);

module.exports = router;