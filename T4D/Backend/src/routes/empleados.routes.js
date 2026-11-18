const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");

const {
  getEmpleados,
  getEmpleado,
  postEmpleado,
  putEmpleado,
  patchEmpleado,
  deleteEmpleado,
} = require("../controllers/empleados.controller");

router.get("/",       verificarRol([1, 2]), getEmpleados);   // Admin, Contador
router.get("/:id",    verificarRol([1, 2]), getEmpleado);    // Admin, Contador
router.post("/",      verificarRol([1]),    postEmpleado);   // Solo Admin
router.put("/:id",    verificarRol([1]),    putEmpleado);    // Solo Admin
router.patch("/:id",  verificarRol([1]),    patchEmpleado);  // Solo Admin
router.delete("/:id", verificarRol([1]),    deleteEmpleado); // Solo Admin

module.exports = router;