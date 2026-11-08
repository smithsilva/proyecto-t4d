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

// Simula la cadena de Supabase: from().select().eq().order().single() ...
// Al hacer "await" devuelve el resultado indicado ({ data, error }).
const consulta = (resultado) => {
  const q = {};
  ["select", "insert", "update", "delete", "eq", "order", "single"].forEach(
    (m) => (q[m] = jest.fn(() => q))
  );
  q.then = (ok, fail) => Promise.resolve(resultado).then(ok, fail);
  return q;
};

// Hace que supabase.from("tabla") devuelva la consulta simulada de esa tabla
const simularTablas = (supabase, tablas) =>
  supabase.from.mockImplementation((tabla) => tablas[tabla]);

module.exports = { ROLES, tokenDe, headers, consulta, simularTablas };