const express = require("express");
const cors = require("cors");

const proveedoresRoutes = require("./routes/proveedores.routes");

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// RUTAS
app.use("/api/proveedores", proveedoresRoutes);

// EXPORTAR APP
module.exports = app;