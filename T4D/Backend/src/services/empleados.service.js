const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

// Empleado + su rol. La respuesta trae  roles: { id_rol, nombre_rol }  (o null si no tiene rol)
const SELECT_EMPLEADOS = `
  SELECT e.*,
         CASE WHEN r.id_rol IS NULL THEN NULL
              ELSE json_build_object('id_rol', r.id_rol, 'nombre_rol', r.nombre_rol)
         END AS roles
    FROM empleados e
    LEFT JOIN roles r ON r.id_rol = e.id_rol`;

const CAMPOS = [
  "cedula",
  "nombre_completo",
  "cargo",
  "salario",
  "fecha_contratacion",
  "fecha_terminacion",
  "tipo_contrato",
  "id_rol",
];

const REQUERIDOS = [
  "cedula",
  "nombre_completo",
  "cargo",
  "salario",
  "fecha_contratacion",
  "tipo_contrato",
];

// =====================================
// UTILIDADES
// =====================================

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Convierte errores de Postgres en errores HTTP entendibles
const traducirError = (error) => {
  if (error.status) return error;

  const mapa = {
    "23505": [409, "Ya existe un empleado con esa cédula"],
    "23503": [400, "El rol seleccionado no existe"],
    "23514": [400, "Algún valor no cumple las reglas de la base de datos (revisa el tipo de contrato y las fechas)"],
    "22P02": [400, "Algún valor tiene un formato inválido"],
    "22007": [400, "Alguna fecha tiene un formato inválido"],
    "22003": [400, "Algún número está fuera del rango permitido"],
    "42P01": [500, "La tabla empleados no existe: ejecuta el SQL de empleados en Postgres"],
    "42703": [500, "A la tabla empleados le falta una columna (id_rol): ejecuta el SQL de empleados en Postgres"],
  };

  const [status, message] = mapa[error.code] || [500, error.message];
  return httpError(status, message);
};

const esFechaValida = (valor) => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const d = new Date(valor);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valor;
};

// Deja solo los campos permitidos, los valida y normaliza.
// parcial = true  → PATCH (solo valida lo que venga)
// parcial = false → POST / PUT (exige los campos obligatorios)
const limpiarEmpleado = (datos = {}, { parcial = false } = {}) => {
  const out = {};

  for (const campo of CAMPOS) {
    if (datos[campo] !== undefined) out[campo] = datos[campo];
  }

  if (!parcial) {
    const faltan = REQUERIDOS.filter(
      (c) => out[c] === undefined || out[c] === null || String(out[c]).trim() === ""
    );
    if (faltan.length) {
      throw httpError(400, `Faltan campos obligatorios: ${faltan.join(", ")}`);
    }
    if (out.fecha_terminacion === undefined) out.fecha_terminacion = null;
    if (out.id_rol === undefined) out.id_rol = null;
  }

  // Textos
  for (const c of ["cedula", "nombre_completo", "cargo", "tipo_contrato"]) {
    if (out[c] !== undefined) {
      out[c] = String(out[c] ?? "").trim();
      if (!out[c]) throw httpError(400, `El campo ${c} no puede estar vacío`);
    }
  }

  if (out.cedula !== undefined && !/^\d{5,15}$/.test(out.cedula)) {
    throw httpError(400, "La cédula debe contener solo números (entre 5 y 15 dígitos)");
  }

  // Salario
  if (out.salario !== undefined) {
    const salario = Number(out.salario);
    if (!Number.isFinite(salario) || salario < 0) {
      throw httpError(400, "El salario debe ser un número mayor o igual a 0");
    }
    out.salario = salario;
  }

  // Fechas
  if (out.fecha_contratacion !== undefined && !esFechaValida(out.fecha_contratacion)) {
    throw httpError(400, "fecha_contratacion debe tener formato AAAA-MM-DD");
  }

  if (out.fecha_terminacion === "" || out.fecha_terminacion === null) {
    out.fecha_terminacion = null;
  } else if (out.fecha_terminacion !== undefined && !esFechaValida(out.fecha_terminacion)) {
    throw httpError(400, "fecha_terminacion debe tener formato AAAA-MM-DD");
  }

  // Rol
  if (out.id_rol === "" || out.id_rol === null) {
    out.id_rol = null;
  } else if (out.id_rol !== undefined) {
    out.id_rol = Number(out.id_rol);
    if (!Number.isInteger(out.id_rol) || out.id_rol <= 0) {
      throw httpError(400, "id_rol inválido");
    }
  }

  // La terminación no puede ser anterior a la contratación
  if (
    out.fecha_contratacion &&
    out.fecha_terminacion &&
    out.fecha_terminacion < out.fecha_contratacion
  ) {
    throw httpError(400, "La fecha de terminación no puede ser anterior a la fecha de contratación");
  }

  if (parcial && Object.keys(out).length === 0) {
    throw httpError(400, "No hay campos válidos para actualizar");
  }

  return out;
};

// =====================================
// GET
// =====================================

const obtenerEmpleados = async () => {
  try {
    const { rows } = await pool.query(`${SELECT_EMPLEADOS} ORDER BY e.id_empleado ASC`);
    return rows;
  } catch (error) {
    throw traducirError(error);
  }
};

const obtenerEmpleadoPorId = async (id) => {
  let rows;
  try {
    ({ rows } = await pool.query(`${SELECT_EMPLEADOS} WHERE e.id_empleado = $1`, [id]));
  } catch (error) {
    throw traducirError(error);
  }

  if (rows.length === 0) throw httpError(404, "Empleado no encontrado");
  return rows[0];
};

// =====================================
// POST
// =====================================

const agregarEmpleado = async (empleado) => {
  const payload = limpiarEmpleado(empleado);

  let filas;
  try {
    filas = await insertar("empleados", payload);
  } catch (error) {
    throw traducirError(error);
  }

  // Se vuelve a consultar para devolver también el nombre del rol
  return obtenerEmpleadoPorId(filas[0].id_empleado);
};

// =====================================
// PUT / PATCH
// =====================================

const actualizarEmpleado = async (id, datos, { parcial = false } = {}) => {
  const payload = limpiarEmpleado(datos, { parcial });

  try {
    // Si solo llega la fecha de terminación, se compara contra la contratación ya guardada
    if (payload.fecha_terminacion && !payload.fecha_contratacion) {
      const { rows } = await pool.query(
        "SELECT fecha_contratacion FROM empleados WHERE id_empleado = $1",
        [id]
      );
      if (rows.length === 0) throw httpError(404, "Empleado no encontrado");

      if (rows[0].fecha_contratacion && payload.fecha_terminacion < rows[0].fecha_contratacion) {
        throw httpError(400, "La fecha de terminación no puede ser anterior a la fecha de contratación");
      }
    }

    const filas = await actualizar("empleados", "id_empleado", id, payload);
    if (filas.length === 0) throw httpError(404, "Empleado no encontrado");
  } catch (error) {
    throw traducirError(error);
  }

  return obtenerEmpleadoPorId(id);
};

// =====================================
// DELETE
// =====================================

const eliminarEmpleado = async (id) => {
  let resultado;
  try {
    resultado = await pool.query("DELETE FROM empleados WHERE id_empleado = $1", [id]);
  } catch (error) {
    throw traducirError(error);
  }

  if (resultado.rowCount === 0) throw httpError(404, "Empleado no encontrado");
};

module.exports = {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  agregarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
};