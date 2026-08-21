const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── MIDDLEWARE API KEY ──
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== "pollo") {
    return res.status(401).json({ error: "API key inválida o ausente" });
  }
  next();
});

const verificarToken = require("./src/middlewares/auth.middleware");

// ── RUTA DE LOGIN (sin verificarToken, todavía no hay token) ──
app.use("/auth", require("./src/routes/auth.routes"));

// ── RUTAS PROTEGIDAS ──
app.use("/productos",    verificarToken, require("./src/routes/productos.routes"));
app.use("/usuarios",     verificarToken, require("./src/routes/usuarios.routes"));
app.use("/reportes",     verificarToken, require("./src/routes/reportes.routes"));
app.use("/asignaciones", verificarToken, require("./src/routes/asignaciones.routes"));
app.use("/proveedores",  verificarToken, require("./src/routes/proveedores.routes"));
app.use("/sucursales",   verificarToken, require("./src/routes/sucursales.routes"));
app.use("/roles",        verificarToken, require("./src/routes/roles.routes"));
app.use("/movimientos",  verificarToken, require("./src/routes/movimientos.routes"));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Servidor T4D corriendo 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});