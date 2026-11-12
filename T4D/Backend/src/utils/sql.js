const pool = require("../config/db");

const ID_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// Protege contra inyección por nombres de tabla/columna
const ident = (nombre) => {
  if (!ID_REGEX.test(nombre)) {
    throw new Error(`Nombre inválido: ${nombre}`);
  }
  return `"${nombre}"`;
};

// INSERT ... RETURNING *  (devuelve un array de filas, como supabase .insert().select())
const insertar = async (tabla, datos, client = pool) => {
  const filas = Array.isArray(datos) ? datos : [datos];
  if (filas.length === 0) return [];

  const cols = Object.keys(filas[0]).filter((k) => filas[0][k] !== undefined);
  const valores = [];
  const grupos = filas.map(
    (fila) =>
      "(" +
      cols
        .map((c) => {
          valores.push(fila[c] === undefined ? null : fila[c]);
          return `$${valores.length}`;
        })
        .join(", ") +
      ")"
  );

  const sql = `INSERT INTO ${ident(tabla)} (${cols.map(ident).join(", ")}) VALUES ${grupos.join(", ")} RETURNING *`;
  const { rows } = await client.query(sql, valores);
  return rows;
};

// UPDATE ... WHERE columnaId = id RETURNING *  (devuelve un array de filas)
const actualizar = async (tabla, columnaId, id, datos, client = pool) => {
  const cols = Object.keys(datos).filter((k) => datos[k] !== undefined);

  if (cols.length === 0) {
    const { rows } = await client.query(
      `SELECT * FROM ${ident(tabla)} WHERE ${ident(columnaId)} = $1`,
      [id]
    );
    return rows;
  }

  const valores = cols.map((c) => datos[c]);
  const sets = cols.map((c, i) => `${ident(c)} = $${i + 1}`).join(", ");
  valores.push(id);

  const sql = `UPDATE ${ident(tabla)} SET ${sets} WHERE ${ident(columnaId)} = $${valores.length} RETURNING *`;
  const { rows } = await client.query(sql, valores);
  return rows;
};

module.exports = { insertar, actualizar, ident };
