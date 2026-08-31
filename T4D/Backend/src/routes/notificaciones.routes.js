const express = require("express");
const router = express.Router();

const {
  getNotificaciones,
  patchLeida,
  postBroadcast,
} = require("../controllers/notificaciones.controller");

// Todos los roles autenticados pueden ver y marcar como leídas SUS PROPIAS
// notificaciones (filtradas por rol desde el token, ver controller).
router.get("/", getNotificaciones);
router.patch("/:id/leida", patchLeida);

// Enviar un mensaje manual a todos los roles. Si quieres restringir esto
// solo a Admin, agrega verificarRol([1]) aquí, igual que en
// historialprecios.routes.js:
//   const verificarRol = require("../middlewares/verificarRol");
//   router.post("/", verificarRol([1]), postBroadcast);
router.post("/", postBroadcast);

module.exports = router;