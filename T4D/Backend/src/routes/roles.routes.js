const express = require("express");
const router = express.Router();
const verificarRol = require("../middlewares/verificarRol");
const { obtenerRoles } = require("../controllers/roles.controller");

router.get("/", verificarRol([1]), obtenerRoles); // Solo Admin

module.exports = router;