const express = require("express");

const router = express.Router();

const {
  getProductos,
  postProducto,
  putProducto,
  deleteProducto,
} = require("../controllers/productos.controller");

// GET
router.get("/", getProductos);

// POST
router.post("/", postProducto);

// PUT
router.put("/:id", putProducto);

// DELETE
router.delete("/:id", deleteProducto);

module.exports = router;