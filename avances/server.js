const express = require("express");
const cors = require("cors");

const authRoutes      = require("./routes/auth");
const productosRoutes = require("./routes/productos");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Auth con prefijo específico, no genérico "/api"
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);

app.listen(3001, () => {
  console.log("Servidor en puerto 3001");
});