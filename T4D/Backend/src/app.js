const express = require("express");
const cors = require("cors");
require("dotenv").config(); // ⚠️ agrégalo si no lo tienes

const verificarApiKey = require("./middlewares/apiKey");
const verificarToken   = require("./middlewares/auth.middleware");

const authRoutes         = require("./routes/auth.routes");
const productosRoutes    = require("./routes/productos.routes");
const movimientosRoutes  = require("./routes/movimientos.routes");
const proveedoresRoutes  = require("./routes/proveedores.routes");
const asignacionesRoutes = require("./routes/asignaciones.routes");
const rolesRoutes        = require("./routes/roles.routes");
const sucursalesRoutes   = require("./routes/sucursales.routes");
const usuariosRoutes     = require("./routes/usuarios.routes");
const reportesRoutes     = require("./routes/reportes.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(verificarApiKey); // capa 1: API key (ya la tenías)

// Ruta de login SIN verificarToken (todavía no hay token)
app.use("/auth", authRoutes);

// Rutas protegidas por JWT (capa 2)
app.use("/productos",    verificarToken, productosRoutes);
app.use("/movimientos",  verificarToken, movimientosRoutes);
app.use("/proveedores",  verificarToken, proveedoresRoutes);
app.use("/asignaciones", verificarToken, asignacionesRoutes);
app.use("/roles",        verificarToken, rolesRoutes);
app.use("/sucursales",   verificarToken, sucursalesRoutes);
app.use("/usuarios",     verificarToken, usuariosRoutes);
app.use("/reportes",     verificarToken, reportesRoutes);

module.exports = app;