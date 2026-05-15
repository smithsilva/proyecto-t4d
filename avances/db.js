const mysql = require("mysql2");
require("dotenv").config();

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conexion.connect((err) => {
  if (err) {
    console.log("Error conexión:", err);
  } else {
    console.log("MySQL conectado");
  }
});

module.exports = conexion;