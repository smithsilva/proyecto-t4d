const express = require("express");
const cors = require("cors");

const verificarApiKey = require("./middlewares/apiKey");

const productosRoutes = require("./routes/productos.routes");
const movimientosRoutes = require("./routes/movimientos.routes");
const proveedoresRoutes = require("./routes/proveedores.routes");
const asignacionesRoutes = require("./routes/asignaciones.routes");
const rolesRoutes = require("./routes/roles.routes");
const sucursalesRoutes = require("./routes/sucursales.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const reportesRoutes = require("./routes/reportes.routes");

const app = express();

app.use(cors());
app.use(express.json());

// PROTEGE TODAS LAS RUTAS
app.use(verificarApiKey);

app.use("/productos", productosRoutes);
app.use("/movimientos", movimientosRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/asignaciones", asignacionesRoutes);
app.use("/roles", rolesRoutes);
app.use("/sucursales", sucursalesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/reportes", reportesRoutes);

module.exports = app;