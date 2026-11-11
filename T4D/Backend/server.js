require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── RUTA PRINCIPAL (Puesta antes del middleware para poder probarla sin API Key en el navegador) ──
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Servidor T4D corriendo 🚀" });
});

// ── MIDDLEWARE API KEY (Opcional: puedes comentarlo si tus pruebas del SENA no lo exigen) ──
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  // Si quieres omitirlo temporalmente para pruebas, puedes comentar esta validación:
  if (process.env.X_API_KEY && (!apiKey || apiKey !== process.env.X_API_KEY)) {
    return res.status(401).json({
      error: "API key inválida o ausente",
    });
  }

  next();
});

const verificarToken = require("./src/middlewares/auth.middleware");

// ── LOGIN ──
app.use("/auth", require("./src/routes/auth.routes"));

// ── RUTAS PROTEGIDAS ──
app.use("/productos",         verificarToken, require("./src/routes/productos.routes"));
app.use("/usuarios",          verificarToken, require("./src/routes/usuarios.routes"));
app.use("/reportes",          verificarToken, require("./src/routes/reportes.routes"));
app.use("/asignaciones",      verificarToken, require("./src/routes/asignaciones.routes"));
app.use("/proveedores",       verificarToken, require("./src/routes/proveedores.routes"));
app.use("/sucursales",        verificarToken, require("./src/routes/sucursales.routes"));
app.use("/roles",             verificarToken, require("./src/routes/roles.routes"));
app.use("/movimientos",       verificarToken, require("./src/routes/movimientos.routes"));
app.use("/categorias",        verificarToken, require("./src/routes/categorias.routes"));
app.use("/historial-precios", verificarToken, require("./src/routes/historialprecios.routes"));
app.use("/notificaciones",    verificarToken, require("./src/routes/notificaciones.routes"));

// ── INICIAR SERVIDOR (Escuchando en 0.0.0.0 para aceptar tráfico externo de AWS) ──
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log("FRONTEND_URL cargada:", process.env.FRONTEND_URL);
});