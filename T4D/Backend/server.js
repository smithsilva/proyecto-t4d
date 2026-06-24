const express = require("express");
const cors    = require("cors");

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

// ── RUTAS ──
app.use("/productos",              require("./src/routes/productos.routes"));
app.use("/usuarios",               require("./src/routes/usuarios.routes"));
app.use("/reportes",               require("./src/routes/reportes.routes"));
app.use("/asignaciones",           require("./src/routes/asignaciones.routes"));
app.use("/proveedores",            require("./src/routes/proveedores.routes"));
app.use("/sucursales",             require("./src/routes/sucursales.routes"));
app.use("/roles",                  require("./src/routes/roles.routes"));
app.use("/movimientos",            require("./src/routes/movimientos.routes"));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Servidor T4D corriendo 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});