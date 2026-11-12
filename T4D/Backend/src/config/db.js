const { Pool, types } = require("pg");

// Para que Postgres devuelva los mismos tipos que devolvía Supabase:
// numeric -> número, bigint -> número, date -> texto "YYYY-MM-DD"
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => parseInt(v, 10));
types.setTypeParser(1082, (v) => v);

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres:", err.message);
});

// Prueba la conexión al arrancar
pool
  .query("SELECT current_database() AS db")
  .then((r) => console.log("Postgres conectado a la base:", r.rows[0].db))
  .catch((e) => console.error("No se pudo conectar a Postgres:", e.message));

module.exports = pool;
