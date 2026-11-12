// Uso:  node scripts/set-password.js correo@ejemplo.com NuevaClave123
// Guarda la clave (cifrada) del usuario en Postgres.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

(async () => {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.log("Uso: node scripts/set-password.js correo@ejemplo.com NuevaClave123");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const r = await pool.query(
    "UPDATE usuarios SET password_hash = $1 WHERE LOWER(email) = LOWER($2) RETURNING id_usuario, email",
    [hash, email]
  );

  if (r.rowCount === 0) {
    console.log("No existe ningun usuario con ese correo:", email);
  } else {
    console.log("Clave actualizada para:", r.rows[0].email);
  }
  await pool.end();
})().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
