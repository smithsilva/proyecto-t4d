const express = require("express");
const cors = require("cors");

const productosRoutes = require("./routes/productos.routes");
const movimientosRoutes = require("./routes/movimientos.routes");
const proveedoresRoutes = require("./routes/proveedores.routes");
const asignacionesRoutes = require("./routes/asignaciones.routes");
const rolesRoutes = require("./routes/roles.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/productos", productosRoutes);
app.use("/movimientos", movimientosRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/asignaciones", asignacionesRoutes);
app.use("/roles", rolesRoutes);

module.exports = app;