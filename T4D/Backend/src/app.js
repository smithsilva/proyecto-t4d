const express = require("express");
const cors = require("cors");

const productosRoutes = require("./routes/productos.routes");
const movimientosRoutes = require("./routes/movimientos.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/productos", productosRoutes);
app.use("/movimientos", movimientosRoutes);

module.exports = app;