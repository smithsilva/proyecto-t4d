const jwt = require("jsonwebtoken");

// Mismos ids de rol que usa el backend
const ROLES = { ADMIN: 1, CONTADORA: 2, GERENTE: 3, MECANICO: 4 };

const tokenDe = (id_rol, opciones = { expiresIn: "1h" }) =>
  jwt.sign(
    { id_usuario: 10, email: "usuario@t4d.com", id_rol },
    process.env.JWT_SECRET,
    opciones
  );

// Cabeceras de una petición autenticada con el rol indicado
const headers = (id_rol) => ({
  "x-api-key": process.env.X_API_KEY,
  Authorization: `Bearer ${tokenDe(id_rol)}`,
});

// Resultado simulado de pool.query(): { rows, rowCount }
const resultado = (rows = [], rowCount = rows.length) => ({ rows, rowCount });

module.exports = { ROLES, tokenDe, headers, resultado };